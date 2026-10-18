import fs from 'fs';
import path from 'path';

// Sensitive keys to redact automatically from log output
const SENSITIVE_PATTERNS = [
  /password/i,
  /passwd/i,
  /secret/i,
  /token/i,
  /authorization/i,
  /bearer/i,
  /ssn/i,
  /credit_card/i,
  /card_number/i,
  /api_key/i,
  /private_key/i
];

/**
 * Recursively redacts sensitive keys and values from objects or strings
 */
export function sanitizeData(data) {
  if (data === null || data === undefined) return data;

  if (typeof data === 'string') {
    // Redact JWT tokens
    let sanitized = data.replace(/eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g, '[REDACTED_JWT_TOKEN]');
    // Redact Bearer tokens
    sanitized = sanitized.replace(/Bearer\s+[a-zA-Z0-9_\-\.]+/gi, 'Bearer [REDACTED_TOKEN]');
    // Redact API keys / secrets in key=value or "key": "value"
    sanitized = sanitized.replace(/(password|secret|token|apiKey|api_key|ssn)\s*[:=]\s*["']?[^"'\s,&]+/gi, '$1=[REDACTED]');
    return sanitized;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  }

  if (typeof data === 'object') {
    const cleanObj = {};
    for (const [key, value] of Object.entries(data)) {
      const isSensitiveKey = SENSITIVE_PATTERNS.some(pattern => pattern.test(key));
      if (isSensitiveKey) {
        cleanObj[key] = '[REDACTED_SENSITIVE_DATA]';
      } else {
        cleanObj[key] = sanitizeData(value);
      }
    }
    return cleanObj;
  }

  return data;
}

/**
 * Secure Logger instance with level filtering and automated data redaction
 */
class SecureLogger {
  constructor() {
    this.logDir = path.join(process.cwd(), 'server', 'logs');
    if (!fs.existsSync(this.logDir)) {
      try {
        fs.mkdirSync(this.logDir, { recursive: true });
      } catch (err) {
        // Fallback if directory creation fails
      }
    }
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const cleanMeta = sanitizeData(meta);
    const cleanMsg = typeof message === 'string' ? sanitizeData(message) : sanitizeData(message);
    
    return JSON.stringify({
      timestamp,
      level,
      message: cleanMsg,
      meta: Object.keys(cleanMeta).length > 0 ? cleanMeta : undefined
    });
  }

  info(message, meta = {}) {
    const formatted = this.formatMessage('INFO', message, meta);
    console.log(`[INFO] ${formatted}`);
    this.writeToFile('access.log', formatted);
  }

  warn(message, meta = {}) {
    const formatted = this.formatMessage('WARN', message, meta);
    console.warn(`\x1b[33m[WARN] ${formatted}\x1b[0m`);
    this.writeToFile('security.log', formatted);
  }

  error(message, meta = {}) {
    const formatted = this.formatMessage('ERROR', message, meta);
    console.error(`\x1b[31m[ERROR] ${formatted}\x1b[0m`);
    this.writeToFile('error.log', formatted);
  }

  securityAlert(event, meta = {}) {
    const formatted = this.formatMessage('SECURITY_ALERT', event, meta);
    console.error(`\x1b[41m\x1b[37m[SECURITY ALERT] ${formatted}\x1b[0m`);
    this.writeToFile('security.log', formatted);
  }

  writeToFile(filename, data) {
    try {
      const filePath = path.join(this.logDir, filename);
      fs.appendFileSync(filePath, data + '\n', 'utf8');
    } catch (err) {
      // Ignore file append errors in read-only environments
    }
  }
}

export const logger = new SecureLogger();
