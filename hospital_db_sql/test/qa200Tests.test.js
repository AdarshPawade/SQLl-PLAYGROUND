import assert from 'assert';
import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { EMPLOYEE_INITIAL_SQL, HOSPITAL_INITIAL_SQL } from '../src/database/schema.js';
import { ALL_CHALLENGES } from '../src/data/challenges.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(`\n====================================================`);
console.log(`🧪 SENIOR QA SW TESTER: 200 AUTOMATED TEST CASES SUITE`);
console.log(`====================================================\n`);

async function getSqlInstanceNode() {
  const wasmPath = path.join(__dirname, '../node_modules/sql.js/dist/sql-wasm.wasm');
  const wasmBinary = fs.readFileSync(wasmPath);
  return await initSqlJs({ wasmBinary });
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

function validateQueryNode(cachedSQL, userQuery, expectedQuery, verificationQuery = null, activeDbKey = 'employee_db') {
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
      return { isMatch: false, message: `Syntax/Runtime Error: ${userExec.error}` };
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

async function run200QaTestSuite() {
  const SQL = await getSqlInstanceNode();
  let totalPassed = 0;
  let totalFailed = 0;
  let testIndex = 1;

  function runCase(description, fn) {
    const caseNum = String(testIndex++).padStart(3, '0');
    try {
      fn();
      console.log(`  [TC-${caseNum}] ✓ PASS: ${description}`);
      totalPassed++;
    } catch (err) {
      console.error(`  [TC-${caseNum}] ✕ FAIL: ${description} -> ${err.message}`);
      totalFailed++;
    }
  }

  // ----------------------------------------------------
  // SECTION 1: ALL 160 PRACTICE CHALLENGES (160 Test Cases)
  // ----------------------------------------------------
  console.log(`-> SECTION 1: Validating All 160 Practice Challenges across Employee & Hospital DBs...`);

  for (const dbKey of ['employee_db', 'hospital_db']) {
    const dbChallenges = ALL_CHALLENGES[dbKey];

    for (const level of ['Beginner', 'Intermediate', 'Pro']) {
      const qList = dbChallenges[level] || [];
      for (const q of qList) {
        runCase(`${dbKey} [${level}] ${q.id}: ${q.title}`, () => {
          const res = validateQueryNode(SQL, q.expectedQuery, q.expectedQuery, q.verificationQuery, dbKey);
          assert.strictEqual(res.isMatch, true, `Expected query evaluation failed for ${q.id}: ${res.message}`);
        });
      }
    }
  }

  // ----------------------------------------------------
  // SECTION 2: LOWERCASE & SYNTAX VARIATIONS (10 Test Cases)
  // ----------------------------------------------------
  console.log(`\n-> SECTION 2: Testing Lowercase SQL Query Variations & Formatting (10 Test Cases)...`);

  const lowercaseCases = [
    { query: 'select * from employees;', expected: 'select * from employees;', db: 'employee_db' },
    { query: 'select first_name, email from employees;', expected: 'select first_name, email from employees;', db: 'employee_db' },
    { query: 'select * from departments where department_id = 1;', expected: 'select * from departments where department_id = 1;', db: 'employee_db' },
    { query: 'select count(*) as total from employees;', expected: 'select count(*) as total from employees;', db: 'employee_db' },
    { query: 'select max(amount) as max_sal from salaries;', expected: 'select max(amount) as max_sal from salaries;', db: 'employee_db' },
    { query: 'select min(budget) as min_b from projects;', expected: 'select min(budget) as min_b from projects;', db: 'employee_db' },
    { query: 'select avg(amount) as avg_sal from salaries;', expected: 'select avg(amount) as avg_sal from salaries;', db: 'employee_db' },
    { query: 'select sum(budget) as total_b from projects;', expected: 'select sum(budget) as total_b from projects;', db: 'employee_db' },
    { query: 'select * from doctors where specialization = "cardiology";', expected: 'select * from doctors where specialization = "cardiology";', db: 'hospital_db' },
    { query: 'select * from patients order by date_of_birth asc;', expected: 'select * from patients order by date_of_birth asc;', db: 'hospital_db' }
  ];

  lowercaseCases.forEach((tc, idx) => {
    runCase(`Lowercase Variation #${idx + 1}: ${tc.query}`, () => {
      const res = validateQueryNode(SQL, tc.query, tc.expected, null, tc.db);
      assert.strictEqual(res.isMatch, true);
    });
  });

  // ----------------------------------------------------
  // SECTION 3: DDL & DML SCHEMA MUTATION TESTS (10 Test Cases)
  // ----------------------------------------------------
  console.log(`\n-> SECTION 3: Testing DDL & DML Schema Mutations & Verification (10 Test Cases)...`);

  const ddlMutationCases = [
    { userSql: "create table test_table (id integer primary key, val varchar(50));", expectedSql: "create table test_table (id integer primary key, val varchar(50));", verificationSql: "select name from sqlite_master where type='table' and lower(name)='test_table';", dbKey: 'employee_db', name: 'Create new table test_table' },
    { userSql: "insert into departments (department_id, department_name, location) values (10, 'qa testing', 'building f');", expectedSql: "insert into departments (department_id, department_name, location) values (10, 'qa testing', 'building f');", verificationSql: "select * from departments where department_id = 10;", dbKey: 'employee_db', name: 'Insert department 10 QA Testing' },
    { userSql: "update departments set location = 'building z' where department_id = 1;", expectedSql: "update departments set location = 'building z' where department_id = 1;", verificationSql: "select * from departments where department_id = 1;", dbKey: 'employee_db', name: 'Update department 1 location to building z' },
    { userSql: "delete from employee_projects where employee_id = 1 and project_id = 1;", expectedSql: "delete from employee_projects where employee_id = 1 and project_id = 1;", verificationSql: "select * from employee_projects;", dbKey: 'employee_db', name: 'Delete employee project link' },
    { userSql: "create view active_emp as select * from employees where department_id = 1;", expectedSql: "create view active_emp as select * from employees where department_id = 1;", verificationSql: "select * from active_emp;", dbKey: 'employee_db', name: 'Create view active_emp' },
    { userSql: "create index idx_hiredate on employees(hire_date);", expectedSql: "create index idx_hiredate on employees(hire_date);", verificationSql: "select name from sqlite_master where type='index' and lower(name)='idx_hiredate';", dbKey: 'employee_db', name: 'Create index idx_hiredate' },
    { userSql: "alter table employees add column notes varchar(50);", expectedSql: "alter table employees add column notes varchar(50);", verificationSql: "select * from employees;", dbKey: 'employee_db', name: 'Alter table add column notes' },
    { userSql: "drop view if exists active_emp;", expectedSql: "drop view if exists active_emp;", verificationSql: "select name from sqlite_master where type='view' and lower(name)='active_emp';", dbKey: 'employee_db', name: 'Drop view active_emp' },
    { userSql: "insert into patients (patient_id, full_name, date_of_birth, contact_number, emergency_contact) values (10, 'john doe', '1985-05-05', '555-0000', '555-9999');", expectedSql: "insert into patients (patient_id, full_name, date_of_birth, contact_number, emergency_contact) values (10, 'john doe', '1985-05-05', '555-0000', '555-9999');", verificationSql: "select * from patients where patient_id = 10;", dbKey: 'hospital_db', name: 'Insert hospital patient 10' },
    { userSql: "update smart_equipment set status = 'active' where equipment_id = 20;", expectedSql: "update smart_equipment set status = 'active' where equipment_id = 20;", verificationSql: "select * from smart_equipment where equipment_id = 20;", dbKey: 'hospital_db', name: 'Update equipment 20 status to active' }
  ];

  ddlMutationCases.forEach(tc => {
    runCase(`DDL/DML Mutation: ${tc.name}`, () => {
      const res = validateQueryNode(SQL, tc.userSql, tc.expectedSql, tc.verificationSql, tc.dbKey);
      assert.strictEqual(res.isMatch, true, `Failed mutation ${tc.name}: ${res.message}`);
    });
  });

  // ----------------------------------------------------
  // SECTION 4: ADVANCED RELATIONAL & WINDOW CLAUSES (10 Test Cases)
  // ----------------------------------------------------
  console.log(`\n-> SECTION 4: Testing Relational Joins, Window Functions & CTEs (10 Test Cases)...`);

  const advancedQueries = [
    { sql: "select e.first_name, d.department_name from employees e join departments d on e.department_id = d.department_id;", db: "employee_db", name: "Join employees and departments" },
    { sql: "select d.department_name, count(e.employee_id) as cnt from departments d left join employees e on d.department_id = e.department_id group by d.department_name;", db: "employee_db", name: "Left join with count aggregation" },
    { sql: "select employee_id, amount, rank() over (partition by employee_id order by amount desc) as rnk from salaries;", db: "employee_db", name: "Window function RANK()" },
    { sql: "select project_name, budget, row_number() over (order by budget desc) as r_num from projects;", db: "employee_db", name: "Window function ROW_NUMBER()" },
    { sql: "with high_sal as (select * from salaries where amount > 70000) select * from high_sal;", db: "employee_db", name: "Common Table Expression WITH" },
    { sql: "select d.department_name, avg(s.amount) as avg_p from departments d join employees e on d.department_id = e.department_id join salaries s on e.employee_id = s.employee_id group by d.department_name;", db: "employee_db", name: "3-Way join aggregation" },
    { sql: "select e1.first_name as e1_name, e2.first_name as e2_name from employees e1 join employees e2 on e1.department_id = e2.department_id and e1.employee_id < e2.employee_id;", db: "employee_db", name: "Self join employees department peers" },
    { sql: "select * from salaries where amount > (select avg(amount) from salaries);", db: "employee_db", name: "Subquery with scalar AVG comparison" },
    { sql: "select doc.first_name, dept.department_name from doctors doc join departments dept on doc.department_id = dept.department_id;", db: "hospital_db", name: "Hospital doctors join departments" },
    { sql: "select p.full_name, a.room_number from patients p join admissions a on p.patient_id = a.patient_id where a.discharge_date is null;", db: "hospital_db", name: "Join active admissions and patients" }
  ];

  advancedQueries.forEach(tc => {
    runCase(`Advanced Query: ${tc.name}`, () => {
      const res = validateQueryNode(SQL, tc.sql, tc.sql, null, tc.db);
      assert.strictEqual(res.isMatch, true, `Failed advanced query ${tc.name}: ${res.message}`);
    });
  });

  // ----------------------------------------------------
  // SECTION 5: EDGE CASES, SYNTAX ERRORS & MISMATCHES (10 Test Cases)
  // ----------------------------------------------------
  console.log(`\n-> SECTION 5: Testing Edge Cases, Syntax Errors & Invalid Queries (10 Test Cases)...`);

  const edgeErrorCases = [
    { userSql: "select * from non_existent_table;", expSql: "select * from employees;", db: "employee_db", expectedFailMessage: "Syntax/Runtime Error", name: "Invalid table name syntax error" },
    { userSql: "select invalid_col from employees;", expSql: "select first_name from employees;", db: "employee_db", expectedFailMessage: "Syntax/Runtime Error", name: "Invalid column name error" },
    { userSql: "select * from employees where department_id = 999;", expSql: "select * from employees;", db: "employee_db", expectedFailMessage: "Row count mismatch", name: "Row count mismatch empty set" },
    { userSql: "select first_name from employees;", expSql: "select first_name, last_name from employees;", db: "employee_db", expectedFailMessage: "Column count mismatch", name: "Column count mismatch error" },
    { userSql: "select first_name as col_a from employees;", expSql: "select first_name as col_b from employees;", db: "employee_db", expectedFailMessage: "Column header mismatch", name: "Column header mismatch error" },
    { userSql: "select first_name from employees where employee_id = 1;", expSql: "select first_name from employees where employee_id = 2;", db: "employee_db", expectedFailMessage: "Wrong Answer", name: "Row data value mismatch" },
    { userSql: "select * from patients where patient_id = 999;", expSql: "select * from patients;", db: "hospital_db", expectedFailMessage: "Row count mismatch", name: "Hospital row count mismatch empty set" },
    { userSql: "select full_name from patients;", expSql: "select full_name, date_of_birth from patients;", db: "hospital_db", expectedFailMessage: "Column count mismatch", name: "Hospital column count mismatch" },
    { userSql: "select * from non_existent_hospital_tbl;", expSql: "select * from patients;", db: "hospital_db", expectedFailMessage: "Syntax/Runtime Error", name: "Hospital invalid table name syntax error" },
    { userSql: "select invalid_field from doctors;", expSql: "select doctor_id from doctors;", db: "hospital_db", expectedFailMessage: "Syntax/Runtime Error", name: "Hospital invalid column error" }
  ];

  edgeErrorCases.forEach(tc => {
    runCase(`Edge Case / Error Handling: ${tc.name}`, () => {
      const res = validateQueryNode(SQL, tc.userSql, tc.expSql, null, tc.db);
      assert.strictEqual(res.isMatch, false, `Expected failure for ${tc.name}, but got success.`);
    });
  });

  console.log(`\n====================================================`);
  console.log(`  QA SUITE COMPLETE: ${totalPassed} PASSED | ${totalFailed} FAILED OUT OF 200 TEST CASES`);
  console.log(`====================================================\n`);

  if (totalFailed > 0) {
    process.exit(1);
  }
}

run200QaTestSuite().catch(err => {
  console.error("FATAL QA TEST RUNNER ERROR:", err);
  process.exit(1);
});
