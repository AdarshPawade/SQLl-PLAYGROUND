import assert from 'assert';
import { sanitizeQuery, executeInSandbox } from '../server/sandbox/sqlSandbox.js';
import { INTERVIEW_CHALLENGES } from '../src/data/interviewPrep.js';
import { MCQ_QUESTIONS } from '../src/data/mcqData.js';

console.log(`\n====================================================`);
console.log(`🧪 BACKEND SECURITY & SANDBOX AUTOMATED TEST SUITE`);
console.log(`====================================================\n`);

async function runBackendTests() {
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

  // 1. Security Sanitization Tests
  test('Security: Safe SELECT query allowed', () => {
    const res = sanitizeQuery('SELECT * FROM employees WHERE department_id = 1');
    assert.strictEqual(res.safe, true);
  });

  test('Security: PRAGMA command blocked as security risk', () => {
    const res = sanitizeQuery('PRAGMA table_info(employees);');
    assert.strictEqual(res.safe, false);
    assert.ok(res.reason.includes('Blocked Security Risk'));
  });

  test('Security: ATTACH DATABASE blocked', () => {
    const res = sanitizeQuery('ATTACH DATABASE "malicious.db" AS test;');
    assert.strictEqual(res.safe, false);
  });

  // 2. Sandboxed Execution Engine Tests
  await asyncTest('Sandbox: Valid query yields isMatch = true', async () => {
    const userSql = 'SELECT first_name, last_name FROM employees;';
    const expectedSql = 'SELECT first_name, last_name FROM employees;';
    const result = await executeInSandbox(userSql, expectedSql, '', 'employee_db');
    assert.strictEqual(result.isMatch, true);
    assert.strictEqual(result.securityAudit, 'SUCCESS');
  });

  await asyncTest('Sandbox: Executes interview_db schema with compatibility functions', async () => {
    const userSql = "SELECT curdate() as today, concat('Dept_', department_id) as dept_code FROM employees LIMIT 1;";
    const expectedSql = "SELECT '2025-01-15' as today, 'Dept_' || department_id as dept_code FROM employees LIMIT 1;";
    const result = await executeInSandbox(userSql, expectedSql, '', 'interview_db');
    assert.strictEqual(result.isMatch, true);
    assert.strictEqual(result.securityAudit, 'SUCCESS');
  });

  await asyncTest('Sandbox: Blocked security risk query returns BLOCKED_SECURITY_RISK', async () => {
    const userSql = 'PRAGMA compile_options;';
    const result = await executeInSandbox(userSql, 'SELECT 1', '', 'employee_db');
    assert.strictEqual(result.isMatch, false);
    assert.strictEqual(result.securityAudit, 'BLOCKED_SECURITY_RISK');
  });

  // 3. Interview Scenarios Test
  test('Data Integrity: Interview prep questions populated', () => {
    assert.ok(INTERVIEW_CHALLENGES.length >= 5);
    INTERVIEW_CHALLENGES.forEach(ch => {
      assert.ok(ch.title);
      assert.ok(ch.expectedQuery);
      assert.ok(ch.hints.length > 0);
    });
  });

  // 4. MCQ Bank Test
  test('Data Integrity: MCQ questions bank populated', () => {
    assert.ok(MCQ_QUESTIONS.length >= 10);
    MCQ_QUESTIONS.forEach(mcq => {
      assert.ok(mcq.question);
      assert.strictEqual(mcq.options.length, 4);
      assert.ok(typeof mcq.correctAnswer === 'number');
    });
  });

  console.log(`\n====================================================`);
  console.log(`  BACKEND TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log(`====================================================\n`);

  if (failed > 0) process.exit(1);
}

runBackendTests();
