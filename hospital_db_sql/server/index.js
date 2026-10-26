import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';

import { logger } from './utils/logger.js';
import { validatePasswordStrength, authenticateAndAuthorize, ROLES } from './utils/auth.js';
import { enforceHttpsAndHsts, wafProtection, applySecurityHeaders, sanitizeAndValidateInputs } from './middleware/security.js';
import { createEncryptedBackup } from './scripts/backup.js';

import healthRoute from './routes/health.js';
import authRoute from './routes/auth.js';
import datasetsRoute from './routes/datasets.js';
import challengesRoute from './routes/challenges.js';
import interviewRoute from './routes/interview.js';
import mcqRoute from './routes/mcq.js';
import executeRoute from './routes/execute.js';
import progressRoute from './routes/progress.js';
import playgroundRoute from './routes/playground.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

const app = express();
const PORT = process.env.PORT || 5000;

// Reverse Proxy & Load Balancer Trust Configuration
app.set('trust proxy', 1);

// Remove Powered-By header & Disable Directory Browsing
app.disable('x-powered-by');

// Enable Gzip Compression for high-throughput 1,000+ users
app.use(compression());

// HTTPS Enforcement & HSTS Headers
app.use(enforceHttpsAndHsts);

// Helmet & CSP Security Headers
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

// CORS Configuration with trusted origins
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://localhost:5000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      logger.warn(`CORS Access Blocked for unauthorized origin: ${origin}`);
      callback(new Error('CORS Access Denied: Unauthorized origin'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Guest-ID'],
  credentials: true
}));

// Input Size Limit & Sanitization Middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(sanitizeAndValidateInputs);

// Web Application Firewall (WAF) Middleware
app.use(wafProtection);

// Rate Limiting tuned for 1,000+ Concurrent Users & NAT Networks
const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1500, // Accommodates multi-user corporate/campus proxies
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/api/health',
  message: { success: false, error: 'Rate Limit Exceeded: Too many requests from this IP. Please try again later.' },
  handler: (req, res, _next, options) => {
    logger.warn(`General Rate Limit Exceeded for IP: ${req.ip}`);
    res.status(429).json(options.message);
  }
});

const executeStrictLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 120, // 120 query executions per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Execution Throttle: Query execution rate limit exceeded.' }
});

app.use('/api', generalApiLimiter);
app.use('/api/execute', executeStrictLimiter);

// Register Core Public API Routes
app.use('/api/health', healthRoute);
app.use('/api/auth', authRoute);
app.use('/api/datasets', datasetsRoute);
app.use('/api/challenges', challengesRoute);
app.use('/api/interview', interviewRoute);
app.use('/api/mcq', mcqRoute);
app.use('/api/execute', executeRoute);
app.use('/api/progress', progressRoute);
app.use('/api/playground', playgroundRoute);

// Backward Compatibility test endpoint
app.post('/api/auth/validate-password', (req, res) => {
  const { password } = req.body;
  const result = validatePasswordStrength(password);
  res.json(result);
});

// Protected Admin Backup Endpoint (RBAC Enforced)
app.post('/api/admin/backup', authenticateAndAuthorize(ROLES.ADMIN), (req, res) => {
  logger.info(`Admin Backup Triggered by User ID: ${req.user.id}`);
  const backupResult = createEncryptedBackup();
  res.json(backupResult);
});

// High-speed static caching for 1,000+ users:
// Hashed assets in /dist/assets (including SQL WASM engine) cached for 1 year
app.use('/assets', express.static(path.join(distPath, 'assets'), {
  maxAge: '1y',
  immutable: true
}));

// Root HTML and other static assets
app.use(express.static(distPath, {
  maxAge: '1h'
}));

// SPA Catch-All Fallback (Serves index.html for non-API client routes)
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) next();
  });
});

// Centralized Error Handling Middleware with Redacted Logs
app.use((err, req, res, _next) => {
  logger.error(`Express Error Exception: ${err.message}`, { stack: err.stack, path: req.path, ip: req.ip });
  res.status(500).json({
    success: false,
    error: 'Internal Server Security Exception',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected security event occurred.' : err.message
  });
});

// Boot Server & Connect DB (Disabled during automated testing or Vercel serverless execution)
let server = null;
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  connectDB().then(() => {
    server = app.listen(PORT, () => {
      logger.info(`SQL Practice Playground Backend Server Active on Port ${PORT}`);
    });
  });

  const gracefulShutdown = async (signal) => {
    logger.info(`Received ${signal}. Gracefully terminating server...`);
    if (server) {
      server.close(async () => {
        logger.info('HTTP listener successfully closed.');
        try {
          const mongoose = (await import('mongoose')).default;
          await mongoose.connection.close();
          logger.info('MongoDB connection successfully closed.');
        } catch {
          // ignore
        }
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

export default app;
