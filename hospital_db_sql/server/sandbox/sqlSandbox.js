import initSqlJs from 'sql.js';
import { EMPLOYEE_INITIAL_SQL, HOSPITAL_INITIAL_SQL } from '../../src/database/schema.js';

let SQL = null;

// Initialize SQL.js engine once for server side sandbox execution
async function getSqlEngine() {
  if (!SQL) {
    SQL = await initSqlJs();
  }
  return SQL;
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

  try {
    const SqlEngine = await getSqlEngine();
    
    // Create dual isolated database instances for user sandbox and master verification sandbox
    const userDb = new SqlEngine.Database();
    const masterDb = new SqlEngine.Database();

    const seedSql = dbKey === 'employee_db' ? EMPLOYEE_INITIAL_SQL : HOSPITAL_INITIAL_SQL;

    // Seed master schemas & tables
    userDb.run(seedSql);
    masterDb.run(seedSql);

    const isDmlDdl = /^\s*(CREATE|INSERT|UPDATE|DELETE|DROP|ALTER|REPLACE)/i.test(userSql.trim());

    if (isDmlDdl) {
      // Handle DDL / DML Query Sandbox
      try {
        // Drop existing table if user is recreating it
        const createMatch = userSql.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)/i);
        if (createMatch && createMatch[1]) {
          userDb.run(`DROP TABLE IF EXISTS ${createMatch[1]};`);
        }

        userDb.run(userSql);
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

      // Run verification query on both user's modified DB and master DB
      const vSql = verificationSql || expectedSql;
      let userRes = [];
      let masterRes = [];

      try {
        const uExec = userDb.exec(vSql);
        if (uExec.length > 0) {
          userRes = formatRes(uExec[0]);
        }

        const mExec = masterDb.exec(expectedSql);
        if (mExec.length > 0) {
          masterRes = formatRes(mExec[0]);
        } else if (verificationSql) {
          const vExec = masterDb.exec(vSql);
          if (vExec.length > 0) masterRes = formatRes(vExec[0]);
        }
      } catch (err) {
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
      // Handle SELECT Query Sandbox
      let userRes = [];
      let masterRes = [];

      try {
        const uExec = userDb.exec(userSql);
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
        const mExec = masterDb.exec(expectedSql);
        if (mExec.length > 0) {
          masterRes = formatRes(mExec[0]);
        }
      } catch (err) {
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
