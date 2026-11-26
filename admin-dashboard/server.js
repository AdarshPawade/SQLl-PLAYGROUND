import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, 'public');

const PORT = Number(process.env.ADMIN_DASHBOARD_PORT || process.env.PORT || 4000);
const HOST = process.env.ADMIN_DASHBOARD_HOST || '127.0.0.1';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(payload));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 64 * 1024) {
        reject(new Error('Request body too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error('Invalid JSON payload'));
      }
    });
    req.on('error', reject);
  });
}

function normalizeTargetBase(targetUrl) {
  if (typeof targetUrl !== 'string' || !targetUrl.trim()) {
    throw new Error('Backend URL is required.');
  }
  const parsed = new URL(targetUrl.trim());
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only http:// or https:// URLs are supported.');
  }
  return parsed.origin + parsed.pathname.replace(/\/+$/, '');
}

const server = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url || '/', `http://${req.headers.host || '127.0.0.1'}`);

  // Proxy stats request server-side to avoid cross-origin browser CORS blocks
  if (req.method === 'POST' && reqUrl.pathname === '/api/proxy-stats') {
    try {
      const { targetUrl, adminKey } = await readJsonBody(req);
      const base = normalizeTargetBase(targetUrl);
      if (typeof adminKey !== 'string' || !adminKey) {
        return sendJson(res, 400, { message: 'Admin secret key is required.' });
      }

      const [statsRes, healthRes] = await Promise.all([
        fetch(`${base}/api/analytics/stats`, {
          method: 'GET',
          headers: { 'x-admin-key': adminKey }
        }),
        fetch(`${base}/api/health`).catch(() => null)
      ]);

      const statsBody = await statsRes.json().catch(() => ({}));
      const healthBody = healthRes ? await healthRes.json().catch(() => null) : null;

      if (!statsRes.ok) {
        return sendJson(res, statsRes.status, {
          message: statsBody.message || statsBody.error || `Backend returned HTTP ${statsRes.status}`
        });
      }

      return sendJson(res, 200, {
        ...statsBody,
        backendHealth: healthBody
      });
    } catch (err) {
      return sendJson(res, 502, {
        message: err.message || 'Unable to reach target SQL Playground backend.'
      });
    }
  }

  if (req.method !== 'GET') {
    res.writeHead(405);
    return res.end('Method Not Allowed');
  }

  const relativePath = reqUrl.pathname === '/' ? '/index.html' : reqUrl.pathname;
  const safePath = path.normalize(relativePath).replace(/^(\.\.[/\\])+/, '');
  const fullPath = path.join(PUBLIC_DIR, safePath);

  if (!fullPath.startsWith(PUBLIC_DIR) || !fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
    res.writeHead(404);
    return res.end('Not Found');
  }

  const ext = path.extname(fullPath);
  res.writeHead(200, {
    'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Cache-Control': 'no-store'
  });
  fs.createReadStream(fullPath).pipe(res);
});

server.listen(PORT, HOST, () => {
  console.log(`SQL Playground External Admin Dashboard running at http://${HOST}:${PORT}`);
});
