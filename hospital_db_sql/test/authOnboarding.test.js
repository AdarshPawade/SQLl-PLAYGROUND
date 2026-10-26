process.env.NODE_ENV = 'test';
import assert from 'assert';
import http from 'http';
import app from '../server/index.js';
import { generateJWT, verifyJWT, hashPassword, generateSalt, verifyPassword } from '../server/utils/auth.js';

console.log(`\n====================================================`);
console.log(`🚀  SQL PLAYGROUND USER ONBOARDING & AUTH TEST SUITE`);
console.log(`====================================================\n`);

async function runAuthSuite() {
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

  // 1. JWT Crypto Tests
  test('JWT: Sign and Verify HMAC-SHA256 Token', () => {
    const payload = { id: 'user_123', username: 'alex_sql', role: 'STUDENT' };
    const token = generateJWT(payload, 3600);
    assert.ok(token);
    assert.strictEqual(token.split('.').length, 3);

    const decoded = verifyJWT(token);
    assert.strictEqual(decoded.id, 'user_123');
    assert.strictEqual(decoded.username, 'alex_sql');
    assert.strictEqual(decoded.role, 'STUDENT');

    // Tampered token test
    const tampered = token.slice(0, -4) + 'abcd';
    const decodedTampered = verifyJWT(tampered);
    assert.strictEqual(decodedTampered, null);
  });

  // 2. Scrypt Password Hashing Tests
  test('Scrypt: Salted password hashing with timing-safe verification', () => {
    const password = 'CorrectHorseBatteryStaple!2026';
    const salt = generateSalt();
    const hash = hashPassword(password, salt);
    assert.ok(hash);

    assert.strictEqual(verifyPassword(password, salt, hash), true);
    assert.strictEqual(verifyPassword('WrongPassword123!', salt, hash), false);
  });

  // 3. HTTP Integration Tests
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;

  async function makeRequest(path, method = 'GET', body = null, headers = {}) {
    return new Promise((resolve, reject) => {
      const payload = body ? JSON.stringify(body) : null;
      const req = http.request({
        hostname: 'localhost',
        port,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
          ...headers
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data), headers: res.headers });
          } catch {
            resolve({ status: res.statusCode, body: data, headers: res.headers });
          }
        });
      });
      req.on('error', reject);
      if (payload) req.write(payload);
      req.end();
    });
  }

  try {
    let authToken = '';

    await asyncTest('API: User Registration (/api/auth/register)', async () => {
      const res = await makeRequest('/api/auth/register', 'POST', {
        username: `student_${Date.now()}`,
        email: `student_${Date.now()}@sqlmaster.edu`,
        password: 'ValidPassword123!',
        fullName: 'Dr. SQL Student',
        targetTrack: 'healthcare'
      });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.token);
      assert.strictEqual(res.body.user.role, 'STUDENT');
      authToken = res.body.token;
    });

    await asyncTest('API: Authenticated Profile (/api/auth/me)', async () => {
      const res = await makeRequest('/api/auth/me', 'GET', null, {
        Authorization: `Bearer ${authToken}`
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.user.id);
    });

    await asyncTest('API: Progress Sync (/api/progress/sync)', async () => {
      const res = await makeRequest('/api/progress/sync', 'POST', {
        completedChallenges: ['emp_beg_1', 'emp_beg_2', 'hosp_beg_1'],
        unlockedProgress: {
          employee_db: { Beginner: 2, Intermediate: 0, Pro: 0 },
          hospital_db: { Beginner: 1, Intermediate: 0, Pro: 0 }
        }
      }, {
        Authorization: `Bearer ${authToken}`
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.progress.solvedQuestions.includes('hosp_beg_1'));
    });

  } finally {
    server.close();
  }

  console.log(`\n====================================================`);
  console.log(`  ONBOARDING SUITE: ${passed} PASSED | ${failed} FAILED`);
  console.log(`====================================================\n`);

  if (failed > 0) process.exit(1);
  process.exit(0);
}


runAuthSuite().catch(err => {
  console.error(err);
  process.exit(1);
});
