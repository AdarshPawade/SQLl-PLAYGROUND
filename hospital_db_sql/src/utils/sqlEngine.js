import initSqlJs from 'sql.js';
import sqlWasm from 'sql.js/dist/sql-wasm.wasm?url';
import { EMPLOYEE_INITIAL_SQL, HOSPITAL_INITIAL_SQL, INTERVIEW_INITIAL_SQL } from '../database/schema';

let sqlPromise = null;
let cachedSQL = null;

/**
 * Normalizes PostgreSQL and MySQL dialect variations for execution in the SQLite WASM engine.
 */
export function normalizeDialectQuery(sql) {
  if (!sql) return '';
  let q = sql;
  // Normalize Postgres typecasts & date functions
  q = q.replace(/DATE_TRUNC\('month',\s*([^)]+)\)::date/gi, "date_trunc('month', $1)");
  q = q.replace(/::date/gi, '');
  q = q.replace(/::text/gi, '');
  q = q.replace(/::int/gi, '');
  q = q.replace(/::numeric/gi, '');
  q = q.replace(/DATE\s+'([^']+)'/gi, "'$1'");
  q = q.replace(/:manager_id/gi, '1');
  q = q.replace(/EXTRACT\s*\(\s*QUARTER\s+FROM\s+([^)]+)\)/gi, "quarter($1)");
  return q;
}

/**
 * Registers custom helper functions so both MySQL and PostgreSQL functions execute.
 */
export function registerCompatibilityFunctions(db) {
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
    db.create_function('date_format', (d, _fmt) => d ? d.substring(0, 7) + '-01' : null);
    db.create_function('concat', (...args) => args.join(''));
    db.create_function('if', (c, a, b) => c ? a : b);
  } catch {
    // Ignore duplicate function creation
  }
}

/**
 * Initializes the sql.js WASM engine.
 */
export async function getSqlInstance() {
  if (!sqlPromise) {
    sqlPromise = initSqlJs({
      locateFile: () => sqlWasm
    }).then(instance => {
      cachedSQL = instance;
      return instance;
    });
  }
  return await sqlPromise;
}

/**
 * Creates and seeds a new in-memory SQLite database instance with case-insensitive settings.
 * Supports employee_db, hospital_db, and interview_db.
 */
export async function createHospitalDatabase(dbKey = 'employee_db') {
  const SQL = await getSqlInstance();
  const db = new SQL.Database();
  db.run('PRAGMA case_sensitive_like = OFF;');
  registerCompatibilityFunctions(db);

  let initSql = EMPLOYEE_INITIAL_SQL;
  if (dbKey === 'hospital_db') {
    initSql = HOSPITAL_INITIAL_SQL;
  } else if (dbKey === 'interview_db') {
    initSql = INTERVIEW_INITIAL_SQL;
  }
  db.run(initSql);
  return db;
}

/**
 * Runs a query against the given sql.js DB instance.
 */
export function executeQuery(db, sqlQuery) {
  const startTime = performance.now();
  try {
    const normalized = normalizeDialectQuery(sqlQuery);
    const results = db.exec(normalized);
    const endTime = performance.now();
    const executionTimeMs = (endTime - startTime).toFixed(2);

    if (!results || results.length === 0) {
      return {
        success: true,
        columns: [],
        values: [],
        rowCount: 0,
        executionTimeMs
      };
    }

    const { columns, values } = results[0];
    return {
      success: true,
      columns,
      values,
      rowCount: values.length,
      executionTimeMs
    };
  } catch (error) {
    const endTime = performance.now();
    return {
      success: false,
      error: error.message || 'SQL Execution Error',
      executionTimeMs: (endTime - startTime).toFixed(2)
    };
  }
}

/**
 * Validates user query against expected reference query.
 * Always evaluates on clean baseline DB instances so firing the query 1 time or 100 times always returns correct!
 */
export function validateUserQuery(sessionDb, userQuery, expectedQuery, verificationQuery = null, activeDbKey = 'employee_db') {
  if (!cachedSQL) {
    return {
      isMatch: false,
      userResult: { success: false, error: 'Database loading...' },
      expectedResult: null,
      message: 'Database engine loading, please try again.'
    };
  }

  let userDb = null;
  let expectedDb = null;

  try {
    // 1. Always evaluate user query against clean baseline DB instance for active schema
    let baseInitSql = EMPLOYEE_INITIAL_SQL;
    if (activeDbKey === 'hospital_db') {
      baseInitSql = HOSPITAL_INITIAL_SQL;
    } else if (activeDbKey === 'interview_db') {
      baseInitSql = INTERVIEW_INITIAL_SQL;
    }

    // Handle CREATE TABLE DDL queries by stripping target table pre-creation from baseInitSql
    const createMatch = userQuery.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)/i);
    if (createMatch && createMatch[1]) {
      const targetTable = createMatch[1].trim();
      const createPattern = new RegExp(`CREATE\\s+TABLE\\s+${targetTable}\\s*\\([\\s\\S]*?\\);`, 'gi');
      baseInitSql = baseInitSql.replace(createPattern, '');
      
      const insertPattern = new RegExp(`INSERT\\s+INTO\\s+${targetTable}\\s+[\\s\\S]*?;`, 'gi');
      baseInitSql = baseInitSql.replace(insertPattern, '');
    }

    // 2. Instantiate clean User DB evaluation instance
    userDb = new cachedSQL.Database();
    userDb.run('PRAGMA case_sensitive_like = OFF;');
    registerCompatibilityFunctions(userDb);
    userDb.run(baseInitSql);

    // Execute user query on clean userDb
    const userExec = executeQuery(userDb, userQuery);
    if (!userExec.success) {
      return {
        isMatch: false,
        userResult: userExec,
        expectedResult: null,
        message: `Syntax/Runtime Error: ${userExec.error}`
      };
    }

    // 3. Instantiate clean Expected DB evaluation instance
    expectedDb = new cachedSQL.Database();
    expectedDb.run('PRAGMA case_sensitive_like = OFF;');
    registerCompatibilityFunctions(expectedDb);
    expectedDb.run(baseInitSql);

    const expectedExec = executeQuery(expectedDb, expectedQuery);

    const isDdlDml = /^\s*(CREATE|INSERT|UPDATE|DELETE|DROP|ALTER|REPLACE|TRUNCATE|WITH|PREPARE)/i.test(userQuery.trim());

    let userResult = userExec;
    let expectedResult = expectedExec;

    if (isDdlDml || verificationQuery) {
      const checkQuery = verificationQuery || getFallbackVerificationQuery(userQuery);
      userResult = executeQuery(userDb, checkQuery);
      expectedResult = executeQuery(expectedDb, checkQuery);
    }

    if (!expectedResult || !expectedResult.success) {
      return {
        isMatch: false,
        userResult,
        expectedResult,
        message: 'Internal reference validation error.'
      };
    }

    // 4. Compare column names (case-insensitive)
    const userCols = (userResult.columns || []).map(c => String(c).toLowerCase().trim());
    const expCols = (expectedResult.columns || []).map(c => String(c).toLowerCase().trim());

    if (userCols.length !== expCols.length) {
      return {
        isMatch: false,
        userResult,
        expectedResult,
        message: `Column count mismatch: Expected ${expCols.length} columns, got ${userCols.length}.`
      };
    }

    const colMatch = userCols.every((col, idx) => col === expCols[idx]);
    if (!colMatch) {
      return {
        isMatch: false,
        userResult,
        expectedResult,
        message: `Column header mismatch. Expected [${expCols.join(', ')}], got [${userCols.join(', ')}].`
      };
    }

    const userVals = userResult.values || [];
    const expVals = expectedResult.values || [];

    if (userVals.length !== expVals.length) {
      return {
        isMatch: false,
        userResult,
        expectedResult,
        message: `Row count mismatch: Expected ${expVals.length} rows, got ${userVals.length} rows.`
      };
    }

    // 5. Case-insensitive serialization of row values
    const serializeRowsCaseInsensitive = (values) =>
      values.map(row => 
        row.map(v => (v === null ? 'null' : String(v).toLowerCase().trim())).join('|')
      );

    const userSerialized = serializeRowsCaseInsensitive(userVals);
    const expSerialized = serializeRowsCaseInsensitive(expVals);

    const exactMatch = userSerialized.every((rowStr, idx) => rowStr === expSerialized[idx]);
    const setMatch = [...userSerialized].sort().join('\n') === [...expSerialized].sort().join('\n');

    if (exactMatch || setMatch) {
      return {
        isMatch: true,
        userResult,
        expectedResult,
        message: '🎉 Congratulations! Your query is correct.'
      };
    }

    return {
      isMatch: false,
      userResult,
      expectedResult,
      message: '❌ Wrong Answer. Check the expected result below.'
    };
  } catch (err) {
    return {
      isMatch: false,
      userResult: { success: false, error: err.message },
      expectedResult: null,
      message: `Execution Error: ${err.message}`
    };
  } finally {
    // Explicitly release WebAssembly linear memory allocations
    if (userDb && typeof userDb.close === 'function') {
      try { userDb.close(); } catch {}
    }
    if (expectedDb && typeof expectedDb.close === 'function') {
      try { expectedDb.close(); } catch {}
    }
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
