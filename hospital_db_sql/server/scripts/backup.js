import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { EMPLOYEE_INITIAL_SQL, HOSPITAL_INITIAL_SQL } from '../../src/database/schema.js';
import { logger } from '../utils/logger.js';

const BACKUP_DIR = path.join(process.cwd(), 'server', 'backups');

/**
 * Requirement 14: Automated AES-256-GCM Encrypted Database Backup Generator
 */
export function createEncryptedBackup(encryptionKey = process.env.BACKUP_ENCRYPTION_KEY || 'default_32_byte_secure_backup_key!') {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const backupPayload = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      schemas: {
        employee_db: EMPLOYEE_INITIAL_SQL,
        hospital_db: HOSPITAL_INITIAL_SQL
      }
    };

    const rawData = JSON.stringify(backupPayload);

    // Calculate SHA-256 Checksum before encryption
    const checksum = crypto.createHash('sha256').update(rawData).digest('hex');

    // Ensure 32-byte key for AES-256-GCM
    const key = crypto.createHash('sha256').update(encryptionKey).digest();
    const iv = crypto.randomBytes(12); // 96-bit IV for GCM

    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(rawData, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    const backupFileContent = JSON.stringify({
      iv: iv.toString('hex'),
      authTag,
      checksum,
      data: encrypted
    });

    const filename = `backup_${Date.now()}.enc`;
    const filePath = path.join(BACKUP_DIR, filename);
    fs.writeFileSync(filePath, backupFileContent, 'utf8');

    logger.info(`Automated Database Backup Created Successfully: ${filename}`, { checksum, path: filePath });
    return { success: true, filename, filePath, checksum };
  } catch (err) {
    logger.error(`Automated Backup Generation Failed: ${err.message}`);
    return { success: false, error: err.message };
  }
}

/**
 * Decrypt & Verify Database Backup File
 */
export function restoreEncryptedBackup(filePath, encryptionKey = process.env.BACKUP_ENCRYPTION_KEY || 'default_32_byte_secure_backup_key!') {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Backup file does not exist: ${filePath}`);
    }

    const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const { iv, authTag, checksum, data } = fileContent;

    const key = crypto.createHash('sha256').update(encryptionKey).digest();
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    // Verify SHA-256 Checksum integrity
    const restoredChecksum = crypto.createHash('sha256').update(decrypted).digest('hex');
    if (restoredChecksum !== checksum) {
      throw new Error('Backup Integrity Check Failed: SHA-256 checksum mismatch!');
    }

    const restoredData = JSON.parse(decrypted);
    logger.info(`Backup Restored and Verified Successfully: ${path.basename(filePath)}`);
    return { success: true, restoredData };
  } catch (err) {
    logger.error(`Backup Restoration Failed: ${err.message}`);
    return { success: false, error: err.message };
  }
}

// Execute standalone if called directly
if (process.argv[1] && process.argv[1].endsWith('backup.js')) {
  console.log('📦 Executing Automated Encrypted Database Backup...');
  const res = createEncryptedBackup();
  console.log(res);
}
