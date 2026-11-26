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

    // 3. Invalid eventType or unsafe target should return 400
    const badEventRes = await request(server, 'POST', '/api/analytics/track', {
      eventType: 'hover',
      target: 'btn'
    });
    assert.strictEqual(badEventRes.status, 400);

    const unsafeTargetRes = await request(server, 'POST', '/api/analytics/track', {
      eventType: 'click',
      target: 'bad target with spaces!'
    });
    assert.strictEqual(unsafeTargetRes.status, 400);

    // 4. Track valid visit, clicks, auth, and solve events
    const visitRes = await request(server, 'POST', '/api/analytics/track', {
      eventType: 'visit',
      target: 'sql_playground_main'
    });
    assert.strictEqual(visitRes.status, 201);
    assert.strictEqual(visitRes.body.success, true);

    const click1 = await request(server, 'POST', '/api/analytics/track', {
      eventType: 'click',
      target: 'run_query_button'
    });
    assert.strictEqual(click1.status, 201);

    const click2 = await request(server, 'POST', '/api/analytics/track', {
      eventType: 'click',
      target: 'run_query_button'
    });
    assert.strictEqual(click2.status, 201);

    const click3 = await request(server, 'POST', '/api/analytics/track', {
      eventType: 'click',
      target: 'show_hint_button'
    });
    assert.strictEqual(click3.status, 201);

    const solveRes = await request(server, 'POST', '/api/analytics/track', {
      eventType: 'solve',
      target: 'solve_emp_beg_1',
      actor: 'alice_dev'
    });
    assert.strictEqual(solveRes.status, 201);

    // 5. Authorized /stats returns aggregated metrics with no-store cache header
    const statsRes = await request(server, 'GET', '/api/analytics/stats', null, {
      'x-admin-key': process.env.ADMIN_SECRET
    });
    assert.strictEqual(statsRes.status, 200);
    assert.ok(String(statsRes.headers['cache-control'] || '').includes('no-store'));
    assert.strictEqual(statsRes.body.totalVisits, 1);
    assert.strictEqual(statsRes.body.totalClicks, 3);
    assert.strictEqual(statsRes.body.totalSolves, 1);
    assert.strictEqual(statsRes.body.clicksByTarget[0]._id, 'run_query_button');
    assert.strictEqual(statsRes.body.clicksByTarget[0].count, 2);
    assert.strictEqual(statsRes.body.recentActivity.length, 5);

    console.log('✓ All analytics route tests passed.');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

run().catch((err) => {
  console.error('✕ Analytics route test failed:', err);
  process.exit(1);
});
