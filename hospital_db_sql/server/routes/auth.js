import express from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { UserProgress } from '../models/UserProgress.js';
import { 
  validatePasswordStrength, 
  generateSalt, 
  hashPassword, 
  verifyPassword, 
  generateJWT, 
  verify2FAToken, 
  generate2FASecret,
  authenticateAndAuthorize,
  ROLES 
} from '../utils/auth.js';
import { secureCookieHelper } from '../middleware/security.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// In-memory fallback user registry for environments without MongoDB
const inMemoryUsers = new Map();

function isMongoReady() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

function findInMemoryUser(identifier) {
  for (const u of inMemoryUsers.values()) {
    if (u.username === identifier || u.email === identifier) {
      return u;
    }
  }
  return null;
}

/**
 * Requirement 4 & Onboarding: User Registration API
 */
router.post('/register', async (req, res) => {
  const { username, email, password, fullName, targetTrack, securityQuestion, securityAnswer } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ 
      success: false, 
      error: 'Username, email, and password are required fields.' 
    });
  }

  const cleanUsername = String(username).trim().toLowerCase();
  const cleanEmail = String(email).trim().toLowerCase();
  const displayFullName = fullName ? String(fullName).trim().slice(0, 64) : String(username).trim().slice(0, 64);

  // Validate format
  if (!/^[a-zA-Z0-9_.-]{3,32}$/.test(cleanUsername)) {
    return res.status(400).json({
      success: false,
      error: 'Username must be 3-32 characters and contain only letters, numbers, dots, dashes, or underscores.'
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid email address.'
    });
  }

  // Enforce enterprise password policy
  const passCheck = validatePasswordStrength(password);
  if (!passCheck.valid) {
    return res.status(400).json({
      success: false,
      error: passCheck.reason
    });
  }

  try {
    // 1. Check existing user
    let existingUser = null;
    if (isMongoReady()) {
      existingUser = await User.findOne({
        $or: [{ username: cleanUsername }, { email: cleanEmail }]
      });
    }
    if (!existingUser) {
      existingUser = findInMemoryUser(cleanUsername) || findInMemoryUser(cleanEmail);
    }

    if (existingUser) {
      const matchField = existingUser.username === cleanUsername ? 'username' : 'email';
      return res.status(409).json({
        success: false,
        error: `An account with this ${matchField} already exists.`
      });
    }

    // 2. Hash Password & Optional Recovery Answer using production scrypt
    const salt = generateSalt();
    const passwordHash = hashPassword(password, salt);

    const normalizedAnswer = typeof securityAnswer === 'string' ? securityAnswer.trim().toLowerCase() : '';
    const securityAnswerSalt = normalizedAnswer ? generateSalt() : '';
    const securityAnswerHash = normalizedAnswer ? hashPassword(normalizedAnswer, securityAnswerSalt) : '';
    const cleanQuestion = typeof securityQuestion === 'string' ? securityQuestion.trim().slice(0, 200) : '';

    let newUser = null;
    let userId = null;

    if (isMongoReady()) {
      newUser = await User.create({
        username: cleanUsername,
        email: cleanEmail,
        passwordHash,
        salt,
        role: ROLES.STUDENT,
        securityQuestion: cleanQuestion,
        securityAnswerHash,
        securityAnswerSalt,
        profile: {
          fullName: displayFullName || cleanUsername,
          targetTrack: targetTrack || 'fullstack',
          onboarded: true
        }
      });
      userId = newUser._id.toString();

      // Initialize Progress Document
      await UserProgress.create({
        userId,
        solvedQuestions: [],
        unlockedProgress: {
          employee_db: { Beginner: 0, Intermediate: 0, Pro: 0 },
          hospital_db: { Beginner: 0, Intermediate: 0, Pro: 0 }
        }
      }).catch(() => {});
    } else {
      // Graceful in-memory fallback when MongoDB is offline
      userId = `mem_user_${Date.now()}`;
      newUser = {
        _id: userId,
        username: cleanUsername,
        email: cleanEmail,
        passwordHash,
        salt,
        role: ROLES.STUDENT,
        securityQuestion: cleanQuestion,
        securityAnswerHash,
        securityAnswerSalt,
        profile: {
          fullName: displayFullName || cleanUsername,
          targetTrack: targetTrack || 'fullstack',
          onboarded: true
        }
      };
      inMemoryUsers.set(userId, newUser);
    }

    // 3. Issue Signed JWT & HttpOnly Secure Cookie
    const token = generateJWT({
      id: userId,
      username: cleanUsername,
      email: cleanEmail,
      role: ROLES.STUDENT
    });

    secureCookieHelper(res, 'session_token', token);
    logger.info(`New user registered successfully: ${cleanUsername} (ID: ${userId})`);

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Welcome to SQL Playground!',
      token,
      user: {
        id: userId,
        username: cleanUsername,
        email: cleanEmail,
        role: ROLES.STUDENT,
        profile: newUser.profile
      }
    });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'An account with this username or email already exists.'
      });
    }
    logger.error(`Registration Error: ${err.message}`);
    res.status(500).json({ success: false, error: 'Registration failed due to an internal server error.' });
  }
});

/**
 * Requirement 4: User Login API
 */
router.post('/login', async (req, res) => {
  const { username, usernameOrEmail, password, twoFactorToken } = req.body;
  const loginIdentifier = String(usernameOrEmail || username || '').trim().toLowerCase();

  if (!loginIdentifier || !password) {
    return res.status(400).json({ 
      success: false, 
      error: 'Username/email and password are required.' 
    });
  }

  try {
    let user = null;
    if (isMongoReady()) {
      user = await User.findOne({
        $or: [{ username: loginIdentifier }, { email: loginIdentifier }]
      });
    }
    if (!user) {
      user = findInMemoryUser(loginIdentifier);
    }

    // Strictly reject unknown accounts instead of issuing fake demo sessions
    if (!user) {
      logger.warn(`Failed login attempt for unknown account: ${loginIdentifier}`);
      return res.status(401).json({ success: false, error: 'Invalid username/email or password.' });
    }

    // Verify Password Hash
    const isPasswordValid = verifyPassword(password, user.salt, user.passwordHash);
    if (!isPasswordValid) {
      logger.warn(`Invalid password attempt for account: ${loginIdentifier}`);
      return res.status(401).json({ success: false, error: 'Invalid username/email or password.' });
    }

    // Verify 2FA if enabled
    if (user.twoFactorEnabled && !verify2FAToken(user.twoFactorSecret, twoFactorToken)) {
      logger.warn(`Failed 2FA token for account: ${loginIdentifier}`);
      return res.status(401).json({ success: false, error: 'Invalid or missing 2FA verification code.' });
    }

    // Update last login
    if (typeof user.save === 'function') {
      user.lastLogin = new Date();
      await user.save().catch(() => {});
    }

    const userId = user._id ? user._id.toString() : user.id;
    const token = generateJWT({
      id: userId,
      username: user.username,
      email: user.email,
      role: user.role
    });

    secureCookieHelper(res, 'session_token', token);
    logger.info(`User logged in successfully: ${user.username} (Role: ${user.role})`);

    res.json({
      success: true,
      token,
      user: {
        id: userId,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile
      },
      message: 'Authentication successful.'
    });
  } catch (err) {
    logger.error(`Login Exception: ${err.message}`);
    res.status(500).json({ success: false, error: 'Authentication failed due to an internal server error.' });
  }
});

/**
 * Password Reset API using Security Question Verification
 */
router.post('/reset-password', async (req, res) => {
  const { usernameOrEmail, securityAnswer, newPassword } = req.body || {};
  const identifier = String(usernameOrEmail || '').trim().toLowerCase();

  if (!identifier || !securityAnswer || !newPassword) {
    return res.status(400).json({
      success: false,
      error: 'Username/email, security answer, and new password are required.'
    });
  }

  const passCheck = validatePasswordStrength(newPassword);
  if (!passCheck.valid) {
    return res.status(400).json({
      success: false,
      error: passCheck.reason
    });
  }

  try {
    let user = null;
    if (isMongoReady()) {
      user = await User.findOne({
        $or: [{ username: identifier }, { email: identifier }]
      });
    }
    if (!user) {
      user = findInMemoryUser(identifier);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Account not found. Please verify your username or email.'
      });
    }

    if (!user.securityAnswerHash || !user.securityAnswerSalt) {
      return res.status(400).json({
        success: false,
        error: 'This account does not have a recovery security question configured.'
      });
    }

    const normalizedAnswer = String(securityAnswer).trim().toLowerCase();
    const isAnswerValid = verifyPassword(normalizedAnswer, user.securityAnswerSalt, user.securityAnswerHash);
    if (!isAnswerValid) {
      return res.status(401).json({
        success: false,
        error: 'Incorrect security question answer.'
      });
    }

    const newSalt = generateSalt();
    const newPasswordHash = hashPassword(newPassword, newSalt);
    user.salt = newSalt;
    user.passwordHash = newPasswordHash;

    if (typeof user.save === 'function') {
      await user.save();
    }

    logger.info(`Password reset completed for account: ${user.username}`);
    res.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    });
  } catch (err) {
    logger.error(`Password Reset Error: ${err.message}`);
    res.status(500).json({ success: false, error: 'Failed to reset password.' });
  }
});

/**
 * Get Current Authenticated User Profile
 */
router.get('/me', authenticateAndAuthorize(ROLES.STUDENT), async (req, res) => {
  try {
    let user = null;
    if (isMongoReady() && mongoose.Types.ObjectId.isValid(req.user.id)) {
      user = await User.findById(req.user.id).select('-passwordHash -salt -twoFactorSecret -securityAnswerHash -securityAnswerSalt');
    }
    if (!user) {
      user = inMemoryUsers.get(req.user.id);
    }

    if (!user) {
      return res.json({
        success: true,
        user: {
          id: req.user.id,
          username: req.user.username,
          role: req.user.role,
          isGuest: false
        }
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id || user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Setup 2FA Key Generation
 */
router.post('/setup-2fa', authenticateAndAuthorize(ROLES.STUDENT), (req, res) => {
  const email = req.user.username + '@sqlplayground.dev';
  const twoFactorData = generate2FASecret(email);
  res.json({ success: true, ...twoFactorData });
});

/**
 * User Logout API
 */
router.post('/logout', (req, res) => {
  res.clearCookie('session_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });
  res.json({ success: true, message: 'Logged out successfully.' });
});

export default router;
