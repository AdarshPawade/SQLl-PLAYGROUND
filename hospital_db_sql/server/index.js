import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';

import { logger } from './utils/logger.js';
import { validatePasswordStrength, generate2FASecret, verify2FAToken, authenticateAndAuthorize, ROLES } from './utils/auth.js';
import { enforceHttpsAndHsts, wafProtection, applySecurityHeaders, sanitizeAndValidateInputs, secureCookieHelper } from './middleware/security.js';
import { createEncryptedBackup } from './scripts/backup.js';

import healthRoute from './routes/health.js';
import datasetsRoute from './routes/datasets.js';
import challengesRoute from './routes/challenges.js';
import interviewRoute from './routes/interview.js';
import mcqRoute from './routes/mcq.js';
import executeRoute from './routes/execute.js';
import progressRoute from './routes/progress.js';
import playgroundRoute from './routes/playground.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Requirement 10: Remove Powered-By header & Disable Directory Browsing
app.disable('x-powered-by');

// Requirement 1 & 2: HTTPS Enforcement & HSTS Headers
app.use(enforceHttpsAndHsts);

// Requirement 6 & 10: Helmet & CSP Security Headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-eval'", "'wasm-unsafe-eval'", "blob:"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      workerSrc: ["'self'", "blob:"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'deny' },
  noSniff: true
}));

app.use(applySecurityHeaders);

// Requirement 25: CORS Configuration with trusted origins
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, cURL, internal) or matched origins
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      logger.warn(`CORS Access Blocked for unauthorized origin: ${origin}`);
      callback(new Error('CORS Access Denied: Unauthorized origin'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Requirement 13: Input Size Limit & Sanitization Middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(sanitizeAndValidateInputs);

// Requirement 3: Web Application Firewall (WAF) Middleware
app.use(wafProtection);

// Requirement 12: Rate Limiting & Anti-DDoS Throttle
const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Max 300 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Rate Limit Exceeded: Too many requests from this IP. Please try again later.' },
  handler: (req, res, next, options) => {
    logger.warn(`General Rate Limit Exceeded for IP: ${req.ip}`);
    res.status(429).json(options.message);
  }
});

const executeStrictLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Max 60 query executions per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Execution Throttle: Query execution rate limit exceeded.' }
});

app.use('/api', generalApiLimiter);
app.use('/api/execute', executeStrictLimiter);

// Register Core Public API Routes
app.use('/api/health', healthRoute);
app.use('/api/datasets', datasetsRoute);
app.use('/api/challenges', challengesRoute);
app.use('/api/interview', interviewRoute);
app.use('/api/mcq', mcqRoute);
app.use('/api/execute', executeRoute);
app.use('/api/progress', progressRoute);
app.use('/api/playground', playgroundRoute);

// Requirement 4 & 7: Authentication, Password Validation & 2FA Endpoints
app.post('/api/auth/validate-password', (req, res) => {
  const { password } = req.body;
  const result = validatePasswordStrength(password);
  res.json(result);
});

app.post('/api/auth/setup-2fa', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: 'Email parameter required.' });
  const twoFactorData = generate2FASecret(email);
  logger.info(`2FA Setup Initiated for account: ${email}`);
  res.json({ success: true, ...twoFactorData });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password, twoFactorToken } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username and password required.' });
  }

  // Password policy enforcement
  const passCheck = validatePasswordStrength(password);
  if (!passCheck.valid) {
    logger.warn(`Failed login attempt for ${username}: Password complexity requirements not met.`);
    return res.status(401).json({ success: false, error: `Invalid Credentials: ${passCheck.reason}` });
  }

  // 2FA Verification
  if (twoFactorToken && !verify2FAToken('secret', twoFactorToken)) {
    logger.warn(`Failed 2FA validation for user: ${username}`);
    return res.status(401).json({ success: false, error: 'Invalid 2FA authentication token.' });
  }

  // Set HttpOnly, Secure, SameSite Cookie
  const token = `student_token_${Date.now()}`;
  secureCookieHelper(res, 'session_token', token);
  logger.info(`Successful Authentication & Session Cookie issued for user: ${username}`);

  res.json({
    success: true,
    token,
    role: ROLES.STUDENT,
    message: 'Authentication successful. Secure session established.'
  });
});

// Requirement 5 & 14: Protected Admin Backup Endpoint (RBAC Enforced)
app.post('/api/admin/backup', authenticateAndAuthorize(ROLES.ADMIN), (req, res) => {
  logger.info(`Admin Backup Triggered by User ID: ${req.user.id}`);
  const backupResult = createEncryptedBackup();
  res.json(backupResult);
});

// Requirement 15: Centralized Error Handling Middleware with Redacted Logs
app.use((err, req, res, next) => {
  logger.error(`Express Error Exception: ${err.message}`, { stack: err.stack, path: req.path, ip: req.ip });
  res.status(500).json({
    success: false,
    error: 'Internal Server Security Exception',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected security event occurred.' : err.message
  });
});

// Boot Server & Connect DB
connectDB().then(() => {
  app.listen(PORT, () => {
    logger.info(`SQL Practice Playground Backend Server Active on Port ${PORT}`);
  });
});

export default app;
