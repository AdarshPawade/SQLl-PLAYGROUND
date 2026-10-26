import initSqlJs from 'sql.js';
import { EMPLOYEE_INITIAL_SQL, HOSPITAL_INITIAL_SQL, INTERVIEW_INITIAL_SQL } from '../../src/database/schema.js';

let SQL = null;

// Initialize SQL.js engine once for server side sandbox execution
async function getSqlEngine() {
  if (!SQL) {
    SQL = await initSqlJs();
  }
  return SQL;
}

/**
 * Normalizes PostgreSQL and MySQL dialect variations for execution in the SQLite WASM engine.
 */
export function normalizeDialectQuery(sql) {
  if (!sql) return '';
  let q = sql;
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
 * Registers custom helper functions so both MySQL and PostgreSQL functions execute in SQLite.
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

// Sanitize & Validate Query for Security Risks
export function sanitizeQuery(sqlString) {
  if (!sqlString || typeof sqlString !== 'string') {
    return { safe: false, reason: 'Empty or invalid query string.' };
  }

  const cleaned = sqlString.trim();

  // Block dangerous SQLite PRAGMAs & System execution commands
  const blockedPatterns = [
    /\bPRAGMA\b/i,
    /\bATTACH\s+DATABASE\b/i,
    /\bDETACH\s+DATABASE\b/i,
    /\bload_extension\b/i,
    /\bfts5\b/i,
    /\bvacuum\b/i
  ];

  for (const pattern of blockedPatterns) {
    if (pattern.test(cleaned)) {
      return { 
        safe: false, 
        reason: 'Blocked Security Risk: System level directives, PRAGMA commands, or external database attachments are prohibited.' 
      };
    }
  }

  return { safe: true, cleaned };
}

// Execute and validate user query against master database schemas in an isolated WASM sandbox
export async function executeInSandbox(userSql, expectedSql, verificationSql, dbKey = 'employee_db') {
  const startTime = performance.now();
  const securityCheck = sanitizeQuery(userSql);

  if (!securityCheck.safe) {
    return {
      isMatch: false,
      userResults: [],
      expectedResults: [],
      error: securityCheck.reason,
      executionTimeMs: Math.round(performance.now() - startTime),
      securityAudit: 'BLOCKED_SECURITY_RISK'
    };
  }

  let userDb = null;
  let masterDb = null;

  try {
    const SqlEngine = await getSqlEngine();
    
    // Create dual isolated database instances for user sandbox and master verification sandbox
    userDb = new SqlEngine.Database();
    masterDb = new SqlEngine.Database();

    userDb.run('PRAGMA case_sensitive_like = OFF;');
    masterDb.run('PRAGMA case_sensitive_like = OFF;');
    registerCompatibilityFunctions(userDb);
    registerCompatibilityFunctions(masterDb);

    let seedSql = EMPLOYEE_INITIAL_SQL;
    if (dbKey === 'hospital_db') {
      seedSql = HOSPITAL_INITIAL_SQL;
    } else if (dbKey === 'interview_db') {
      seedSql = INTERVIEW_INITIAL_SQL;
    }

    const normUserSql = normalizeDialectQuery(userSql);
    const normExpectedSql = normalizeDialectQuery(expectedSql);
    const isDmlDdl = /^\s*(CREATE|INSERT|UPDATE|DELETE|DROP|ALTER|REPLACE)/i.test(normUserSql.trim());

    if (isDmlDdl) {
      // Handle CREATE TABLE DDL queries by stripping target table pre-creation from seedSql
      const createMatch = normUserSql.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)/i);
      if (createMatch && createMatch[1]) {
        const targetTable = createMatch[1].trim();
        const createPattern = new RegExp(`CREATE\\s+TABLE\\s+${targetTable}\\s*\\([\\s\\S]*?\\);`, 'gi');
        seedSql = seedSql.replace(createPattern, '');
        
        const insertPattern = new RegExp(`INSERT\\s+INTO\\s+${targetTable}\\s+[\\s\\S]*?;`, 'gi');
        seedSql = seedSql.replace(insertPattern, '');
      }

      // Seed baseline schemas
      userDb.run(seedSql);
      masterDb.run(seedSql);

      // Handle DDL / DML Query Sandbox
      try {
        userDb.run(normUserSql);
      } catch (err) {
        return {
          isMatch: false,
          userResults: [],
          expectedResults: [],
          error: `SQL Syntax Error: ${err.message}`,
          executionTimeMs: Math.round(performance.now() - startTime),
          securityAudit: 'SYNTAX_ERROR'
        };
      }

      // Execute expected query on masterDb
      if (normExpectedSql) {
        try {
          masterDb.run(normExpectedSql);
        } catch {
          // Expected query execution safeguard
        }
      }

      // Run verification query on both user's modified DB and master DB
      const vSql = normalizeDialectQuery(verificationSql || expectedSql);
      let userRes = [];
      let masterRes = [];

      try {
        const uExec = userDb.exec(vSql);
        if (uExec.length > 0) {
          userRes = formatRes(uExec[0]);
        }

        const mExec = masterDb.exec(vSql);
        if (mExec.length > 0) {
          masterRes = formatRes(mExec[0]);
        }
      } catch {
        // Verification query run on modified DB
      }

      const isMatch = compareResults(userRes, masterRes);
      return {
        isMatch,
        userResults: userRes,
        expectedResults: masterRes,
        error: null,
        executionTimeMs: Math.round(performance.now() - startTime),
        securityAudit: 'SUCCESS'
      };

    } else {
      // Seed baseline schemas
      userDb.run(seedSql);
      masterDb.run(seedSql);

      // Handle SELECT Query Sandbox
      let userRes = [];
      let masterRes = [];

      try {
        const uExec = userDb.exec(normUserSql);
        if (uExec.length > 0) {
          userRes = formatRes(uExec[0]);
        }
      } catch (err) {
        return {
          isMatch: false,
          userResults: [],
          expectedResults: [],
          error: `SQL Execution Error: ${err.message}`,
          executionTimeMs: Math.round(performance.now() - startTime),
          securityAudit: 'SYNTAX_ERROR'
        };
      }

      try {
        const mExec = masterDb.exec(normExpectedSql);
        if (mExec.length > 0) {
          masterRes = formatRes(mExec[0]);
        }
      } catch {
        // Expected query error safeguard
      }

      const isMatch = compareResults(userRes, masterRes);
      return {
        isMatch,
        userResults: userRes,
        expectedResults: masterRes,
        error: null,
        executionTimeMs: Math.round(performance.now() - startTime),
        securityAudit: 'SUCCESS'
      };
    }

  } catch (err) {
    return {
      isMatch: false,
      userResults: [],
      expectedResults: [],
      error: `Sandbox Environment Exception: ${err.message}`,
      executionTimeMs: Math.round(performance.now() - startTime),
      securityAudit: 'EXCEPTION'
    };
  } finally {
    // Explicitly release WebAssembly linear memory allocations
    if (userDb && typeof userDb.close === 'function') {
      try { userDb.close(); } catch {}
    }
    if (masterDb && typeof masterDb.close === 'function') {
      try { masterDb.close(); } catch {}
    }
  }
}

// Utility: Format raw sql.js output into array of row objects
function formatRes(resObj) {
  if (!resObj || !resObj.columns) return [];
  return resObj.values.map(row => {
    const obj = {};
    resObj.columns.forEach((col, idx) => {
      obj[col.toLowerCase()] = row[idx];
    });
    return obj;
  });
}

// Utility: Deep comparison of query result sets
function compareResults(res1, res2) {
  if (!Array.isArray(res1) || !Array.isArray(res2)) return false;
  if (res1.length !== res2.length) return false;
  if (res1.length === 0 && res2.length === 0) return true;

  const str1 = JSON.stringify(res1.map(r => normalizeRow(r)));
  const str2 = JSON.stringify(res2.map(r => normalizeRow(r)));
  return str1 === str2;
}

function normalizeRow(row) {
  const sortedKeys = Object.keys(row).sort();
  const normalized = {};
  for (const k of sortedKeys) {
    normalized[k] = row[k];
  }
  return normalized;
}
