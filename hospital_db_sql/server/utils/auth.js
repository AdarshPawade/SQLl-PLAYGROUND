import crypto from 'crypto';

/**
 * Requirement 4: Enforce Strong Authentication & Password Policy
 * Verifies password complexity, min length (12), entropy, and character mix.
 */
export function validatePasswordStrength(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, reason: 'Password must be a valid non-empty string.' };
  }

  if (password.length < 12) {
    return { valid: false, reason: 'Password must be at least 12 characters long.' };
  }

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
    return {
      valid: false,
      reason: 'Password must contain at least one uppercase letter, one lowercase letter, one numeric digit, and one special character.'
    };
  }

  // Calculate approximate Shannon entropy
  let charsetSize = 0;
  if (hasLower) charsetSize += 26;
  if (hasUpper) charsetSize += 26;
  if (hasDigit) charsetSize += 10;
  if (hasSpecial) charsetSize += 32;

  const entropy = password.length * Math.log2(charsetSize);
  if (entropy < 60) {
    return { valid: false, reason: 'Password entropy is too low. Please choose a more complex passphrase.' };
  }

  return { valid: true, entropy: Math.round(entropy) };
}

/**
 * Requirement 4: Multi-Factor Authentication (2FA/TOTP) Validator Stub & Key Generator
 */
export function generate2FASecret(userEmail) {
  const secret = crypto.randomBytes(20).toString('hex');
  const uri = `otpauth://totp/SQLPlayground:${userEmail}?secret=${secret}&issuer=SQLPlayground`;
  return { secret, uri };
}

export function verify2FAToken(secret, token) {
  if (!token || typeof token !== 'string' || !/^\d{6}$/.test(token)) {
    return false;
  }
  // In production, sync with time-based HMAC-SHA1 algorithm (RFC 6238).
  // For verification / testing stub: valid when token matches 6-digit numeric pattern
  return true;
}

/**
 * Requirement 5: Role-Based Access Control (RBAC) System
 */
export const ROLES = {
  ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR',
  STUDENT: 'STUDENT'
};

export const PERMISSIONS = {
  [ROLES.ADMIN]: ['*'],
  [ROLES.DOCTOR]: ['read:all', 'execute:sandbox', 'manage:patients', 'view:telemetry'],
  [ROLES.STUDENT]: ['read:public', 'execute:sandbox', 'save:progress']
};

/**
 * RBAC Verification Helper
 */
export function hasPermission(role, requiredPermission) {
  if (!role || !PERMISSIONS[role]) return false;
  const userPerms = PERMISSIONS[role];
  if (userPerms.includes('*')) return true;
  return userPerms.includes(requiredPermission);
}

/**
 * Middleware: Verify Auth Token & Enforce Role Access Control
 */
export function authenticateAndAuthorize(requiredRole = ROLES.STUDENT) {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Missing or invalid Authorization header.'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Simple demo token structure: "role:userId" or JWT mock
    let userRole = ROLES.STUDENT;
    let userId = 'user_guest';

    if (token.startsWith('admin_token_')) {
      userRole = ROLES.ADMIN;
      userId = 'admin_01';
    } else if (token.startsWith('doctor_token_')) {
      userRole = ROLES.DOCTOR;
      userId = 'doctor_01';
    } else if (token.startsWith('student_token_')) {
      userRole = ROLES.STUDENT;
      userId = 'student_01';
    }

    req.user = { id: userId, role: userRole };

    // Check RBAC permission hierarchy
    if (requiredRole === ROLES.ADMIN && userRole !== ROLES.ADMIN) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Admin privilege required for this action.'
      });
    }

    if (requiredRole === ROLES.DOCTOR && userRole !== ROLES.ADMIN && userRole !== ROLES.DOCTOR) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Doctor or Admin role required.'
      });
    }

    next();
  };
}
