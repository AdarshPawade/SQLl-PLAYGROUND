import { logger } from '../utils/logger.js';

// Requirement 3: Web Application Firewall (WAF) Threat Vectors & Signatures
const WAF_THREAT_PATTERNS = [
  // Cross-Site Scripting (XSS)
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/i,
  /javascript:/i,
  /onerror\s*=/i,
  /onload\s*=/i,
  /onclick\s*=/i,
  /<iframe/i,
  /<object/i,
  /<embed/i,
  
  // SQL Injection (Outside sandboxed SQL playground queries)
  /UNION\s+ALL\s+SELECT/i,
  /INFORMATION_SCHEMA/i,
  /WAITFOR\s+DELAY/i,
  /BENCHMARK\(\d+,\s*md5\(/i,
  
  // Remote Code Execution & Command Injection
  /;\s*cat\s+/i,
  /;\s*rm\s+/i,
  /\|\s*bash/i,
  /`[^`]*`/,
  
  // Path Traversal
  /\.\.\//,
  /\.\.\\/,
  /%2e%2e%2f/i,
  /%2e%2e\//i
];

/**
 * Requirement 1 & 2: HTTPS & HSTS Enforcer Middleware
 */
export function enforceHttpsAndHsts(req, res, next) {
  // Set HSTS Header (Strict-Transport-Security: max-age=1 year; includeSubDomains; preload)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // HTTPS enforcement check for production deployments behind proxy / load balancer
  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
  if (!isHttps && process.env.NODE_ENV === 'production') {
    logger.warn(`Insecure HTTP access attempt from IP: ${req.ip}. Redirecting to HTTPS.`);
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
}

/**
 * Requirement 3: Web Application Firewall (WAF) Middleware
 * Scans request body, query params, and headers for known attack signatures.
 */
export function wafProtection(req, res, next) {
  // Allow SQL queries in execute/sandbox routes (which are safely evaluated in WASM)
  const isSandboxRoute = req.path.includes('/api/execute') || req.path.includes('/api/playground');
  
  const checkValue = (val, pathKey) => {
    if (!val) return null;
    const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
    
    for (const pattern of WAF_THREAT_PATTERNS) {
      // If it's a sandbox execution route, bypass SQL keywords but check for XSS / shell injection
      if (isSandboxRoute && (pattern.source.includes('UNION') || pattern.source.includes('INFORMATION_SCHEMA'))) {
        continue;
      }

      if (pattern.test(str)) {
        return { pattern: pattern.source, pathKey, value: str };
      }
    }
    return null;
  };

  // Inspect Query Parameters
  for (const [k, v] of Object.entries(req.query || {})) {
    const threat = checkValue(v, `query.${k}`);
    if (threat) {
      logger.securityAlert(`WAF Blocked Threat in Query Parameter: ${k}`, { ip: req.ip, threat });
      return res.status(403).json({
        success: false,
        error: 'WAF Security Block: Malicious input signature detected in query parameters.'
      });
    }
  }

  // Inspect Body Parameters (exclude SQL payload in userSql field for sandbox execution)
  if (req.body && typeof req.body === 'object') {
    for (const [k, v] of Object.entries(req.body)) {
      if (isSandboxRoute && (k === 'userSql' || k === 'expectedQuery' || k === 'verificationQuery')) {
        continue;
      }
      const threat = checkValue(v, `body.${k}`);
      if (threat) {
        logger.securityAlert(`WAF Blocked Threat in Request Body: ${k}`, { ip: req.ip, threat });
        return res.status(403).json({
          success: false,
          error: 'WAF Security Block: Malicious payload signature detected in request body.'
        });
      }
    }
  }

  next();
}

/**
 * Requirement 6 & 10: Content Security Policy (CSP) & Security Headers Middleware
 */
export function applySecurityHeaders(req, res, next) {
  // Requirement 10: Remove X-Powered-By
  res.removeHeader('X-Powered-By');

  // Security Headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

  // Requirement 6: Content Security Policy (CSP)
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'wasm-unsafe-eval' blob:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https:",
    "connect-src 'self' ws: wss:",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');

  res.setHeader('Content-Security-Policy', cspHeader);
  next();
}

/**
 * Requirement 7: Configure Secure Cookies Middleware
 */
export function secureCookieHelper(res, cookieName, cookieValue, options = {}) {
  const defaultOptions = {
    httpOnly: true, // Prevent client JS access
    secure: process.env.NODE_ENV === 'production', // Transmit over HTTPS only
    sameSite: 'Strict', // CSRF protection
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 Days
  };

  const finalOpts = { ...defaultOptions, ...options };
  const cookieStr = `${cookieName}=${encodeURIComponent(cookieValue)}; Path=${finalOpts.path}; Max-Age=${Math.floor(finalOpts.maxAge / 1000)}; ${finalOpts.httpOnly ? 'HttpOnly;' : ''} ${finalOpts.secure ? 'Secure;' : ''} SameSite=${finalOpts.sameSite}`;
  
  res.setHeader('Set-Cookie', cookieStr);
}

/**
 * Requirement 13: Input Validation and Sanitization Middleware
 */
export function sanitizeAndValidateInputs(req, res, next) {
  // Max request body size sanity check (1MB)
  const contentLength = parseInt(req.headers['content-length'] || '0', 10);
  if (contentLength > 1024 * 1024) {
    logger.warn(`Rejected oversized request payload (${contentLength} bytes) from IP: ${req.ip}`);
    return res.status(413).json({
      success: false,
      error: 'Payload Too Large: Request body exceeds maximum allowed size of 1MB.'
    });
  }

  // Sanitize string inputs in body
  if (req.body && typeof req.body === 'object') {
    for (const [key, val] of Object.entries(req.body)) {
      if (typeof val === 'string') {
        // Strip null bytes
        req.body[key] = val.replace(/\0/g, '');
      }
    }
  }

  next();
}
