import assert from 'assert';
import http from 'http';

process.env.NODE_ENV = 'test';
process.env.ADMIN_SECRET = 'test_admin_secret_key_for_ci_123';

const { default: app } = await import('../server/index.js');

function request(server, method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const addr = server.address();
    const payload = body ? JSON.stringify(body) : null;
    const reqHeaders = { ...headers };
    if (payload) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: addr.port,
        path,
        method,
        headers: reqHeaders
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          let parsed = null;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = data;
          }
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function run() {
  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });

  try {
    // 1. Unauthenticated /stats should return 403
    const noKeyRes = await request(server, 'GET', '/api/analytics/stats');
    assert.strictEqual(noKeyRes.status, 403);

    // 2. Wrong key should return 403
    const wrongKeyRes = await request(server, 'GET', '/api/analytics/stats', null, {
      'x-admin-key': 'wrong_secret'
    });
    assert.strictEqual(wrongKeyRes.status, 403);

    // 3. Non-visit action logging should be rejected (400)
    const badEventRes = await request(server, 'POST', '/api/analytics/track', {
      eventType: 'click',
      target: 'run_query_button'
    });
    assert.strictEqual(badEventRes.status, 400);

    // 4. Visit counting works cleanly
    const visit1 = await request(server, 'POST', '/api/analytics/track', {
      eventType: 'visit'
    });
    assert.strictEqual(visit1.status, 201);
    assert.strictEqual(visit1.body.success, true);

    const visit2 = await request(server, 'POST', '/api/analytics/track', {
      eventType: 'visit'
    });
    assert.strictEqual(visit2.status, 201);

    // 5. Authorized /stats returns aggregate visit & user counts only
    const statsRes = await request(server, 'GET', '/api/analytics/stats', null, {
      'x-admin-key': process.env.ADMIN_SECRET
    });
    assert.strictEqual(statsRes.status, 200);
    assert.ok(String(statsRes.headers['cache-control'] || '').includes('no-store'));
    assert.strictEqual(statsRes.body.totalVisits, 2);
    assert.strictEqual(statsRes.body.visitsToday, 2);
    assert.strictEqual(typeof statsRes.body.totalUsers, 'number');
    assert.strictEqual(Array.isArray(statsRes.body.dailyStats), true);
    assert.strictEqual(statsRes.body.dailyStats.length, 7);
    assert.strictEqual(statsRes.body.recentActivity, undefined);
    assert.strictEqual(statsRes.body.recentUsers, undefined);

    console.log('✓ All analytics route tests passed.');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

run().catch((err) => {
  console.error('✕ Analytics route test failed:', err);
  process.exit(1);
});
