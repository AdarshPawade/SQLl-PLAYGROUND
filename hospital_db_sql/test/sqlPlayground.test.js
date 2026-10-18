import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { ALL_CHALLENGES } from '../src/data/challenges.js';
import { EMPLOYEE_INITIAL_SQL, HOSPITAL_INITIAL_SQL, EMPLOYEE_SCHEMA_INFO, HOSPITAL_SCHEMA_INFO } from '../src/database/schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let passed = 0;
let failed = 0;
let cachedSQL = null;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failed++;
    console.error(`  ❌ FAIL: ${message}`);
  }
}

async function getSqlInstanceNode() {
  if (!cachedSQL) {
    const wasmPath = path.join(__dirname, '../node_modules/sql.js/dist/sql-wasm.wasm');
    const wasmBinary = fs.readFileSync(wasmPath);
    cachedSQL = await initSqlJs({
      wasmBinary
    });
  }
  return cachedSQL;
}

async function createDatabaseNode(dbKey = 'employee_db') {
  const SQL = await getSqlInstanceNode();
  const db = new SQL.Database();
  db.run('PRAGMA case_sensitive_like = OFF;');
  const initSql = dbKey === 'employee_db' ? EMPLOYEE_INITIAL_SQL : HOSPITAL_INITIAL_SQL;
  db.run(initSql);
  return db;
}

function executeQueryNode(db, sqlQuery) {
  try {
    const results = db.exec(sqlQuery);
    if (!results || results.length === 0) {
      return { success: true, columns: [], values: [], rowCount: 0 };
    }
    const { columns, values } = results[0];
    return { success: true, columns, values, rowCount: values.length };
  } catch (error) {
    return { success: false, error: error.message || 'SQL Execution Error' };
  }
}

function validateQueryNode(sessionDb, userQuery, expectedQuery, verificationQuery = null, activeDbKey = 'employee_db') {
  try {
    let baseInitSql = activeDbKey === 'employee_db' ? EMPLOYEE_INITIAL_SQL : HOSPITAL_INITIAL_SQL;

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
    userDb.run(baseInitSql);

    const userExec = executeQueryNode(userDb, userQuery);
    if (!userExec.success) {
      return { isMatch: false, userResult: userExec, expectedResult: null, message: userExec.error };
    }

    const expectedDb = new cachedSQL.Database();
    expectedDb.run('PRAGMA case_sensitive_like = OFF;');
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

    if (!expectedResult || !expectedResult.success) return { isMatch: false };

    const userCols = (userResult.columns || []).map(c => String(c).toLowerCase().trim());
    const expCols = (expectedResult.columns || []).map(c => String(c).toLowerCase().trim());
    if (userCols.length !== expCols.length) return { isMatch: false };

    const colMatch = userCols.every((col, idx) => col === expCols[idx]);
    if (!colMatch) return { isMatch: false };

    const userVals = userResult.values || [];
    const expVals = expectedResult.values || [];
    if (userVals.length !== expVals.length) return { isMatch: false };

    const serializeRows = (values) => values.map(row => row.map(v => (v === null ? 'null' : String(v).toLowerCase().trim())).join('|'));
    const userSerialized = serializeRows(userVals);
    const expSerialized = serializeRows(expVals);

    const exactMatch = userSerialized.every((rowStr, idx) => rowStr === expSerialized[idx]);
    const setMatch = [...userSerialized].sort().join('\n') === [...expSerialized].sort().join('\n');

    return { isMatch: exactMatch || setMatch, userResult, expectedResult };
  } catch (err) {
    return { isMatch: false, error: err.message };
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

async function runTestSuite() {
  console.log('====================================================');
  console.log('  RUNNING AUTOMATED TEST SUITE: SQL PLAYGROUND');
  console.log('====================================================\n');

  await getSqlInstanceNode();

  // Test 1: Verify Schema Seed Counts (5 rows per table)
  console.log('[TEST GROUP 1] Schema Seed Row Counts (5 default rows per table)');
  const empDb = await createDatabaseNode('employee_db');
  EMPLOYEE_SCHEMA_INFO.forEach(tbl => {
    const res = executeQueryNode(empDb, `SELECT COUNT(*) AS cnt FROM ${tbl.tableName};`);
    assert(res.success && res.values[0][0] === 5, `Employee DB table '${tbl.tableName}' has 5 seed rows`);
  });

  const hospDb = await createDatabaseNode('hospital_db');
  HOSPITAL_SCHEMA_INFO.forEach(tbl => {
    const res = executeQueryNode(hospDb, `SELECT COUNT(*) AS cnt FROM ${tbl.tableName};`);
    assert(res.success && res.values[0][0] === 5, `Hospital DB table '${tbl.tableName}' has 5 seed rows`);
  });

  console.log('\n[TEST GROUP 2] Case-Insensitivity & Repeatable Query Execution');
  const q1 = ALL_CHALLENGES.employee_db.Beginner[0];
  const run1 = validateQueryNode(empDb, q1.expectedQuery, q1.expectedQuery, q1.verificationQuery, 'employee_db');
  assert(run1.isMatch === true, 'First execution of Q1 passes');

  // Repeatable Query Execution Test (firing query AGAIN)
  const run2 = validateQueryNode(empDb, q1.expectedQuery, q1.expectedQuery, q1.verificationQuery, 'employee_db');
  assert(run2.isMatch === true, 'Re-firing exact same query AGAIN passes with isMatch=true (Repeatable Test)');

  // Case-Insensitivity Test on SELECT query Q3
  const q3 = ALL_CHALLENGES.employee_db.Beginner[2];
  const lowerQuery = q3.expectedQuery.toLowerCase();
  const run3 = validateQueryNode(empDb, lowerQuery, q3.expectedQuery, q3.verificationQuery, 'employee_db');
  assert(run3.isMatch === true, 'Lowercase SQL query evaluates as correct (Case-Insensitive Test)');

  console.log('\n[TEST GROUP 3] Testing All 110 SQL Questions in Curriculum');
  for (const dbKey of ['employee_db', 'hospital_db']) {
    const dbInstance = await createDatabaseNode(dbKey);
    for (const levelKey of ['Beginner', 'Intermediate', 'Pro']) {
      const questions = ALL_CHALLENGES[dbKey][levelKey] || [];
      console.log(`  -> Testing ${dbKey} [${levelKey}] (${questions.length} questions)...`);
      questions.forEach((q, idx) => {
        const testRes = validateQueryNode(
          dbInstance,
          q.expectedQuery,
          q.expectedQuery,
          q.verificationQuery,
          dbKey
        );
        assert(testRes.isMatch === true, `${dbKey} - ${levelKey} Q${idx + 1}: ${q.title}`);
      });
    }
  }

  console.log('\n====================================================');
  console.log(`  TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite();
