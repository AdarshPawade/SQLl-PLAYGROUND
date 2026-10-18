import assert from 'assert';
import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { 
  EMPLOYEE_INITIAL_SQL, 
  HOSPITAL_INITIAL_SQL, 
  INTERVIEW_INITIAL_SQL 
} from '../src/database/schema.js';
import { ALL_CHALLENGES } from '../src/data/challenges.js';
import { INTERVIEW_QUESTIONS } from '../src/data/interviewQuestions.js';
import { INTERVIEW_CHALLENGES } from '../src/data/interviewPrep.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(`\n========================================================================`);
console.log(`🧪 MASTER QA SOFTWARE TEST SUITE: COMPLETE QUESTION & ENGINE VALIDATION`);
console.log(`========================================================================\n`);

async function getSqlInstanceNode() {
  const wasmPath = path.join(__dirname, '../node_modules/sql.js/dist/sql-wasm.wasm');
  const wasmBinary = fs.readFileSync(wasmPath);
  return await initSqlJs({ wasmBinary });
}

function normalizeDialect(sql) {
  if (!sql) return '';
  let q = sql;
  q = q.replace(/DATE_TRUNC\('month',\s*([^)]+)\)::date/gi, "date_trunc('month', $1)");
  q = q.replace(/::date/gi, '');
  q = q.replace(/::text/gi, '');
  q = q.replace(/::int/gi, '');
  q = q.replace(/::numeric/gi, '');
  q = q.replace(/DATE\s+'([^']+)'/gi, "'$1'");
  q = q.replace(/:manager_id/gi, '1');
  q = q.replace(/EXTRACT\s*\(\s*QUARTER\s+FROM\s+([^)]+)\)/gi, 'quarter($1)');
  return q;
}

function registerCompatibilityFunctions(db) {
  try {
    db.create_function('date_trunc', (part, d) => d ? d.substring(0, 7) + '-01' : null);
    db.create_function('bool_and', (val) => val ? 1 : 0);
    db.create_function('datediff', (d1, d2) => {
      if (!d1 || !d2) return 0;
      const diff = (new Date(d1) - new Date(d2)) / (1000 * 60 * 60 * 24);
      return Math.round(diff);
    });
    db.create_function('quarter', (d) => {
      if (!d) return 1;
      const month = new Date(d).getMonth() + 1;
      return Math.ceil(month / 3);
    });
    db.create_function('now', () => '2025-01-15 12:00:00');
    db.create_function('curdate', () => '2025-01-15');
    db.create_function('date_format', (d, fmt) => d ? d.substring(0, 7) + '-01' : null);
    db.create_function('concat', (...args) => args.join(''));
    db.create_function('if', (c, a, b) => c ? a : b);
  } catch (e) {}
}

function executeQueryNode(db, sqlQuery) {
  try {
    const normalized = normalizeDialect(sqlQuery);
    const results = db.exec(normalized);
    if (!results || results.length === 0) {
      return { success: true, columns: [], values: [], rowCount: 0 };
    }
    const { columns, values } = results[0];
    return { success: true, columns, values, rowCount: values.length };
  } catch (error) {
    return { success: false, error: error.message || 'SQL Execution Error' };
  }
}

function validateSubmission(cachedSQL, userQuery, expectedQuery, verificationQuery = null, activeDbKey = 'employee_db') {
  try {
    let baseInitSql = EMPLOYEE_INITIAL_SQL;
    if (activeDbKey === 'hospital_db') {
      baseInitSql = HOSPITAL_INITIAL_SQL;
    } else if (activeDbKey === 'interview_db') {
      baseInitSql = INTERVIEW_INITIAL_SQL;
    }

    const createMatch = userQuery.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)/i);
    if (createMatch && createMatch[1]) {
      const targetTable = createMatch[1].trim();
      const createPattern = new RegExp(`CREATE\\s+TABLE\\s+${targetTable}\\s*\\([\\s\\S]*?\\);`, 'gi');
      baseInitSql = baseInitSql.replace(createPattern, '');
      const insertPattern = new RegExp(`INSERT\\s+INTO\\s+${targetTable}\\s+[\\s\\S]*?;`, 'gi');
      baseInitSql = baseInitSql.replace(insertPattern, '');
    }

    const userDb = new cachedSQL.Database();
    userDb.run('PRAGMA case_sensitive_like = OFF;');
    registerCompatibilityFunctions(userDb);
    userDb.run(baseInitSql);

    const userExec = executeQueryNode(userDb, userQuery);
    if (!userExec.success) {
      return { isMatch: false, message: `Syntax/Runtime Error: ${userExec.error}` };
    }

    const expectedDb = new cachedSQL.Database();
    expectedDb.run('PRAGMA case_sensitive_like = OFF;');
    registerCompatibilityFunctions(expectedDb);
    expectedDb.run(baseInitSql);

    const expectedExec = executeQueryNode(expectedDb, expectedQuery);

    const isDdlDml = /^\s*(CREATE|INSERT|UPDATE|DELETE|DROP|ALTER|REPLACE|TRUNCATE|WITH|PREPARE)/i.test(userQuery.trim());

    let userResult = userExec;
    let expectedResult = expectedExec;

    if (isDdlDml || verificationQuery) {
      const checkQuery = verificationQuery || getFallbackVerificationQuery(userQuery);
      userResult = executeQueryNode(userDb, checkQuery);
      expectedResult = executeQueryNode(expectedDb, checkQuery);
    }

    if (!expectedResult || !expectedResult.success) {
      return { isMatch: false, message: 'Internal reference validation error.' };
    }

    const userCols = (userResult.columns || []).map(c => String(c).toLowerCase().trim());
    const expCols = (expectedResult.columns || []).map(c => String(c).toLowerCase().trim());

    if (userCols.length !== expCols.length) {
      return { isMatch: false, message: `Column count mismatch: Expected ${expCols.length}, got ${userCols.length}.` };
    }

    const colMatch = userCols.every((col, idx) => col === expCols[idx]);
    if (!colMatch) {
      return { isMatch: false, message: `Column header mismatch: [${expCols.join(', ')}] vs [${userCols.join(', ')}].` };
    }

    const userVals = userResult.values || [];
    const expVals = expectedResult.values || [];

    if (userVals.length !== expVals.length) {
      return { isMatch: false, message: `Row count mismatch: Expected ${expVals.length}, got ${userVals.length}.` };
    }

    const serializeRows = (values) =>
      values.map(row => row.map(v => (v === null ? 'null' : String(v).toLowerCase().trim())).join('|'));

    const userSerialized = serializeRows(userVals);
    const expSerialized = serializeRows(expVals);

    const exactMatch = userSerialized.every((rowStr, idx) => rowStr === expSerialized[idx]);
    const setMatch = [...userSerialized].sort().join('\n') === [...expSerialized].sort().join('\n');

    if (exactMatch || setMatch) {
      return { isMatch: true, message: 'Correct' };
    }

    return { isMatch: false, message: 'Wrong Answer' };
  } catch (err) {
    return { isMatch: false, message: err.message };
  }
}

function getFallbackVerificationQuery(userQuery) {
  const matchTable = userQuery.match(/(?:INTO|TABLE|FROM|UPDATE)\s+([a-zA-Z0-9_]+)/i);
  if (matchTable && matchTable[1]) {
    const tbl = matchTable[1];
    if (/CREATE TABLE/i.test(userQuery)) {
      return `SELECT name FROM sqlite_master WHERE type='table' AND LOWER(name)='${tbl.toLowerCase()}';`;
    }
    return `SELECT * FROM ${tbl};`;
  }
  return "SELECT name FROM sqlite_master WHERE type='table';";
}

async function runMasterTestSuite() {
  const SQL = await getSqlInstanceNode();
  let totalPassed = 0;
  let totalFailed = 0;
  let suiteNumber = 0;

  function runTest(suite, id, title, fn) {
    suiteNumber++;
    try {
      fn();
      console.log(`[PASS #${String(suiteNumber).padStart(3, '0')}] [${suite}] ${id} -> ${title}`);
      totalPassed++;
    } catch (e) {
      console.error(`[FAIL #${String(suiteNumber).padStart(3, '0')}] [${suite}] ${id} -> ${title}: ${e.message}`);
      totalFailed++;
    }
  }

  // 1. PRACTICE CHALLENGES (160 Questions)
  console.log(`--- [STAGE 1] VALIDATING 160 PRACTICE CHALLENGES (EMPLOYEE & HOSPITAL DBS) ---`);
  for (const dbKey of ['employee_db', 'hospital_db']) {
    for (const level of ['Beginner', 'Intermediate', 'Pro']) {
      const questions = ALL_CHALLENGES[dbKey]?.[level] || [];
      for (const q of questions) {
        runTest(dbKey.toUpperCase(), q.id, q.title, () => {
          const res = validateSubmission(SQL, q.expectedQuery, q.expectedQuery, q.verificationQuery, dbKey);
          assert.strictEqual(res.isMatch, true, res.message);
        });
      }
    }
  }

  // 2. ADVANCED INTERVIEW QUESTIONS (50 Questions)
  console.log(`\n--- [STAGE 2] VALIDATING 50 ADVANCED SQL INTERVIEW QUESTIONS ---`);
  for (const q of INTERVIEW_QUESTIONS) {
    runTest('INTERVIEW-50', q.id, q.title, () => {
      const res = validateSubmission(SQL, q.expectedQuery, q.expectedQuery, null, 'interview_db');
      assert.strictEqual(res.isMatch, true, res.message);
    });
  }

  // 3. INTERVIEW PREPARATION SCENARIOS (5 Questions)
  console.log(`\n--- [STAGE 3] VALIDATING TECHNICAL INTERVIEW PREP SCENARIOS ---`);
  for (const q of INTERVIEW_CHALLENGES) {
    runTest('INTERVIEW-PREP', q.id, q.title, () => {
      const res = validateSubmission(SQL, q.expectedQuery, q.expectedQuery, q.verificationQuery, q.database);
      assert.strictEqual(res.isMatch, true, res.message);
    });
  }

  // 4. VARCHAR SCHEMA COMPLIANCE TESTS
  console.log(`\n--- [STAGE 4] VERIFYING VARCHAR DATA TYPE QUESTION REQUIREMENTS ---`);
  const varcharIds = ['emp_beg_1', 'emp_pro_11', 'hosp_beg_1', 'hosp_pro_11'];
  for (const dbKey of ['employee_db', 'hospital_db']) {
    for (const level of ['Beginner', 'Intermediate', 'Pro']) {
      const questions = ALL_CHALLENGES[dbKey]?.[level] || [];
      for (const q of questions) {
        if (varcharIds.includes(q.id)) {
          runTest('VARCHAR-CHECK', q.id, `${q.title} (VARCHAR Syntax & Evaluation)`, () => {
            assert.ok(/varchar/i.test(q.description), `Question description must specify VARCHAR: ${q.description}`);
            assert.ok(/varchar/i.test(q.hint), `Question hint must use VARCHAR: ${q.hint}`);
            assert.ok(/varchar/i.test(q.expectedQuery), `Question expectedQuery must use VARCHAR: ${q.expectedQuery}`);
            const res = validateSubmission(SQL, q.expectedQuery, q.expectedQuery, q.verificationQuery, dbKey);
            assert.strictEqual(res.isMatch, true, res.message);
          });
        }
      }
    }
  }

  console.log(`\n========================================================================`);
  console.log(`MASTER QA TEST SUITE SUMMARY:`);
  console.log(`TOTAL PASSED: ${totalPassed} | TOTAL FAILED: ${totalFailed} (Total Tested: ${suiteNumber})`);
  console.log(`========================================================================\n`);

  if (totalFailed > 0) {
    process.exit(1);
  }
}

runMasterTestSuite().catch(err => {
  console.error('Fatal Test Runner Exception:', err);
  process.exit(1);
});
