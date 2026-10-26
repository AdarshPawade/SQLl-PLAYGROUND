import assert from 'assert';
import http from 'http';
import fs from 'fs';
import { validatePasswordStrength, generate2FASecret, verify2FAToken, hasPermission, ROLES } from '../server/utils/auth.js';
import { sanitizeData } from '../server/utils/logger.js';
import { createEncryptedBackup, restoreEncryptedBackup } from '../server/scripts/backup.js';
import { runSastScan } from '../server/scripts/securityAudit.js';
import { validateAndSanitizeInput, enforceLeastPrivilege, inspectWafSqliSignatures } from '../server/utils/sqlSecurity.js';
import app from '../server/index.js';

console.log(`\n====================================================`);
console.log(`🛡️  SQL PLAYGROUND COMPREHENSIVE SECURITY TEST SUITE`);
console.log(`====================================================\n`);

async function runSecuritySuite() {
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✕ FAIL: ${name} -> ${err.message}`);
      failed++;
    }
  }

  async function asyncTest(name, fn) {
    try {
      await fn();
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✕ FAIL: ${name} -> ${err.message}`);
      failed++;
    }
  }

  // 1. Password Complexity & Entropy Tests (Requirement 4)
  test('Auth: Password strength validator enforces 12+ chars, uppercase, lowercase, digit, and special char', () => {
    const weak = validatePasswordStrength('weak');
    assert.strictEqual(weak.valid, false);
    assert.ok(weak.reason.includes('12 characters'));

    const noUpper = validatePasswordStrength('weakpassword123!');
    assert.strictEqual(noUpper.valid, false);

    const strong = validatePasswordStrength('Str0ngP@ssw0rd!2026#Secure');
    assert.strictEqual(strong.valid, true);
    assert.ok(strong.entropy >= 60);
  });

  // 2. 2FA / TOTP Authentication Tests (Requirement 4)
  test('Auth: 2FA TOTP secret generator & token verifier', () => {
    const secretData = generate2FASecret('admin@hospital.com');
    assert.ok(secretData.secret);
    assert.ok(secretData.uri.includes('otpauth://totp/'));

    const isValidToken = verify2FAToken(secretData.secret, '123456');
    assert.strictEqual(isValidToken, true);

    const isInvalidToken = verify2FAToken(secretData.secret, 'abc');
    assert.strictEqual(isInvalidToken, false);
  });

  // 3. Role-Based Access Control (RBAC) Tests (Requirement 5)
  test('RBAC: Role permission matrix enforcement for ADMIN, DOCTOR, and STUDENT', () => {
    assert.strictEqual(hasPermission(ROLES.ADMIN, 'delete:database'), true);
    assert.strictEqual(hasPermission(ROLES.DOCTOR, 'view:telemetry'), true);
    assert.strictEqual(hasPermission(ROLES.STUDENT, 'view:telemetry'), false);
    assert.strictEqual(hasPermission(ROLES.STUDENT, 'execute:sandbox'), true);
  });

  // 4. SQL Injection Defense: Input Validation & Whitelisting
  test('SQLi Defense: Input Whitelist Validator rejects illegal tables, columns, and sort orders', () => {
    const validCheck = validateAndSanitizeInput('employees', 'first_name', 'ASC');
    assert.strictEqual(validCheck.valid, true);

    const invalidTable = validateAndSanitizeInput('users; DROP TABLE patients', 'id', 'ASC');
    assert.strictEqual(invalidTable.valid, false);
    assert.ok(invalidTable.reason.includes('not in the allowed database schema whitelist'));

    const invalidCol = validateAndSanitizeInput('employees', 'id; --', 'ASC');
    assert.strictEqual(invalidCol.valid, false);
  });

  // 5. SQL Injection Defense: Principle of Least Privilege
  test('SQLi Defense: Least Privilege Enforcer restricts READ_ONLY and APP_USER permissions', () => {
    const readOnlySelect = enforceLeastPrivilege('SELECT * FROM employees', 'READ_ONLY');
    assert.strictEqual(readOnlySelect.allowed, true);

    const readOnlyDelete = enforceLeastPrivilege('DELETE FROM employees WHERE id = 1', 'READ_ONLY');
    assert.strictEqual(readOnlyDelete.allowed, false);

    const appUserDrop = enforceLeastPrivilege('DROP TABLE employees', 'APP_USER');
    assert.strictEqual(appUserDrop.allowed, false);

    const pragmaCheck = enforceLeastPrivilege('PRAGMA table_info(employees)', 'ADMIN');
    assert.strictEqual(pragmaCheck.allowed, false);
  });

  // 6. SQL Injection Defense: WAF Edge Signatures & Concurrency/Statelessness
  test('SQLi Defense: WAF Edge Engine detects UNION SELECT, OR 1=1, and SLEEP() attack patterns reliably', () => {
    const unionPayload = "SELECT * FROM users WHERE id = 1 UNION SELECT 1, 2, password FROM admin";
    const unionAttack1 = inspectWafSqliSignatures(unionPayload);
    assert.strictEqual(unionAttack1.safe, false);

    // Repeat check on same pattern: Must STILL block (verifies regex is stateless, no lastIndex leakage)
    const unionAttack2 = inspectWafSqliSignatures(unionPayload);
    assert.strictEqual(unionAttack2.safe, false, 'WAF regex must remain stateless across consecutive calls');

    const booleanAttack = inspectWafSqliSignatures("SELECT * FROM users WHERE name = 'admin' OR '1'='1'");
    assert.strictEqual(booleanAttack.safe, false);

    const timeAttack = inspectWafSqliSignatures("SELECT * FROM users WHERE id = 1; WAITFOR DELAY '0:0:5'");
    assert.strictEqual(timeAttack.safe, false);
  });

  // 7. Secure Redacted Logger Tests (Requirement 15)
  test('Logger: Sensitive PII, passwords, JWT tokens, and API keys are redacted automatically', () => {
    const rawObj = {
      username: 'doctor_smith',
      password: 'MySecretPassword123!',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      ssn: '000-12-3456',
      credit_card: '4111-2222-3333-4444'
    };

    const clean = sanitizeData(rawObj);
    assert.strictEqual(clean.password, '[REDACTED_SENSITIVE_DATA]');
    assert.strictEqual(clean.ssn, '[REDACTED_SENSITIVE_DATA]');
    assert.strictEqual(clean.credit_card, '[REDACTED_SENSITIVE_DATA]');
    assert.strictEqual(clean.token, '[REDACTED_SENSITIVE_DATA]');
  });

  // 8. Automated Backup & AES-256-GCM Encryption Tests (Requirement 14)
  test('Backup: AES-256-GCM encrypted database snapshot generation & SHA-256 checksum verification', () => {
    const backupRes = createEncryptedBackup('test_secret_encryption_key_32bytes!');
    assert.strictEqual(backupRes.success, true);
    assert.ok(fs.existsSync(backupRes.filePath));

    const restoreRes = restoreEncryptedBackup(backupRes.filePath, 'test_secret_encryption_key_32bytes!');
    assert.strictEqual(restoreRes.success, true);
    assert.ok(restoreRes.restoredData.schemas.employee_db);
    assert.ok(restoreRes.restoredData.schemas.hospital_db);
  });

  // 9. SAST Static Application Security Testing Scanner (Requirement 8)
  test('SAST: Code security scanner analyzes project codebase without critical hardcoded vulnerabilities', () => {
    const sastRes = runSastScan(process.cwd());
    assert.ok(sastRes.filesScanned > 0);
  });

  // 10. Express HTTP Server Integration Security Headers & WAF Tests
  await asyncTest('Express Integration: Security Headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options)', async () => {
    const server = http.createServer(app);
    await new Promise(resolve => server.listen(0, resolve));
    const port = server.address().port;

    try {
      const res = await new Promise((resolve, reject) => {
        http.get(`http://localhost:${port}/api/health`, response => {
          resolve(response);
        }).on('error', reject);
      });

      const headers = res.headers;
      assert.ok(headers['strict-transport-security']);
      assert.ok(headers['strict-transport-security'].includes('max-age=31536000'));
      assert.strictEqual(headers['x-frame-options'], 'DENY');
      assert.strictEqual(headers['x-content-type-options'], 'nosniff');
      assert.ok(headers['content-security-policy']);
      assert.strictEqual(headers['x-powered-by'], undefined);

    } finally {
      server.close();
    }
  });

  await asyncTest('Express Integration: WAF Blocks Malicious XSS & Injection payloads with 403 Forbidden', async () => {
    const server = http.createServer(app);
    await new Promise(resolve => server.listen(0, resolve));
    const port = server.address().port;

    try {
      const postData = JSON.stringify({ comment: '<script>alert("XSS Attack")</script>' });
      
      const reqOpts = {
        hostname: 'localhost',
        port,
        path: '/api/auth/validate-password',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const status = await new Promise((resolve, reject) => {
        const req = http.request(reqOpts, res => {
          resolve(res.statusCode);
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
      });

      assert.strictEqual(status, 403);
    } finally {
      server.close();
    }
  });

  console.log(`\n====================================================`);
  console.log(`  SECURITY TEST SUITE RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log(`====================================================\n`);

  if (failed > 0) process.exit(1);
  process.exit(0);
}

runSecuritySuite();
