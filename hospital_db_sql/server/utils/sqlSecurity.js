/**
 * SQL Security Module: Implements Prepared Statements, Input Whitelisting,
 * Least Privilege Role Enforcement, WAF SQLi Signatures, and Stored Procedures.
 */

// Whitelist of valid database tables and columns for strict input validation
export const ALLOWED_TABLES = [
  'employees', 'departments', 'salaries', 'projects', 'employee_projects',
  'doctors', 'patients', 'admissions', 'smart_equipment'
];

export const ALLOWED_SORT_DIRECTIONS = ['ASC', 'DESC'];

/**
 * 1. Prepared Statements (Parameterized Queries)
 * Binds parameters dynamically using prepared statement binding.
 */
export function executeParameterizedQuery(dbEngine, sqlQuery, params = []) {
  if (!dbEngine || typeof dbEngine.prepare !== 'function') {
    throw new Error('Invalid DB Engine instance for prepared statement execution.');
  }

  const stmt = dbEngine.prepare(sqlQuery);
  try {
    stmt.bind(params);
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return { success: true, data: results };
  } catch (err) {
    if (stmt && typeof stmt.free === 'function') stmt.free();
    throw new Error(`Parameterized Execution Error: ${err.message}`);
  }
}

/**
 * 2. Input Validation and Sanitization (Whitelist & Type Enforcement)
 */
export function validateAndSanitizeInput(tableName, columnName, sortOrder = 'ASC') {
  const cleanTable = String(tableName).toLowerCase().trim();
  const cleanCol = String(columnName).toLowerCase().trim();
  const cleanOrder = String(sortOrder).toUpperCase().trim();

  // Whitelist table check
  if (!ALLOWED_TABLES.includes(cleanTable)) {
    return {
      valid: false,
      reason: `Security Error: Table '${tableName}' is not in the allowed database schema whitelist.`
    };
  }

  // Whitelist identifier format check (only alphanumeric & underscore)
  if (!/^[a-zA-Z0-9_]+$/.test(cleanCol)) {
    return {
      valid: false,
      reason: `Security Error: Column identifier '${columnName}' contains illegal characters.`
    };
  }

  // Whitelist sort direction
  if (!ALLOWED_SORT_DIRECTIONS.includes(cleanOrder)) {
    return {
      valid: false,
      reason: `Security Error: Invalid sort order '${sortOrder}'. Must be ASC or DESC.`
    };
  }

  return {
    valid: true,
    sanitized: { table: cleanTable, column: cleanCol, sortOrder: cleanOrder }
  };
}

/**
 * 3. Principle of Least Privilege Enforcement
 */
export const DB_ROLE_PERMISSIONS = {
  READ_ONLY: ['SELECT', 'WITH'],
  APP_USER: ['SELECT', 'INSERT', 'UPDATE'],
  ADMIN: ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP']
};

export function enforceLeastPrivilege(sqlQuery, userRole = 'APP_USER') {
  if (!sqlQuery || typeof sqlQuery !== 'string') {
    return { allowed: false, reason: 'Invalid SQL query payload.' };
  }

  const trimmedSql = sqlQuery.trim();
  const allowedCommands = DB_ROLE_PERMISSIONS[userRole] || DB_ROLE_PERMISSIONS.APP_USER;
  
  // Extract initial SQL command keyword
  const commandMatch = trimmedSql.match(/^\s*([a-zA-Z]+)/);
  const command = commandMatch ? commandMatch[1].toUpperCase() : '';

  if (!allowedCommands.includes(command)) {
    return {
      allowed: false,
      reason: `Least Privilege Violation: User role '${userRole}' is not permitted to execute '${command}' statements.`
    };
  }

  // Block forbidden systemic commands regardless of role
  const forbiddenSystemic = [/\bPRAGMA\b/i, /\bATTACH\b/i, /\bDETACH\b/i, /\bVACUUM\b/i];
  for (const pattern of forbiddenSystemic) {
    if (pattern.test(trimmedSql)) {
      return {
        allowed: false,
        reason: 'Security Violation: System directives and database modifications are strictly prohibited.'
      };
    }
  }

  return { allowed: true, command };
}

/**
 * 4. Web Application Firewall (WAF) Edge Signatures for SQL Injection
 */
export const WAF_SQLI_PATTERNS = [
  /UNION\s+(?:ALL\s+)?SELECT/i,
  /OR\s+['"]?1['"]?\s*=\s*['"]?1/i,
  /AND\s+['"]?1['"]?\s*=\s*['"]?1/i,
  /WAITFOR\s+DELAY/i,
  /BENCHMARK\(\d+,\s*md5\(/i,
  /SLEEP\(\d+\)/i,
  /\/\*!\d+.*?\*\//i, // Inline MySQL conditional comments
  /;\s*DROP\s+TABLE/i,
  /;\s*DELETE\s+FROM/i,
  /0x[0-9a-fA-F]+/i // Hexadecimal string payloads
];

export function inspectWafSqliSignatures(inputString) {
  if (!inputString || typeof inputString !== 'string') return { safe: true };

  for (const pattern of WAF_SQLI_PATTERNS) {
    if (pattern.test(inputString)) {
      return {
        safe: false,
        pattern: pattern.source,
        reason: 'WAF Rule Triggered: Detected high-risk SQL Injection pattern.'
      };
    }
  }

  return { safe: true };
}

/**
 * 5. Stored Procedure & Abstract View Definition Helper
 */
export function createAbstractViewProcedure(dbInstance, viewName, queryDef) {
  if (!/^[a-zA-Z0-9_]+$/.test(viewName)) {
    throw new Error('Invalid view identifier for stored procedure creation.');
  }

  const createViewSql = `CREATE VIEW IF NOT EXISTS ${viewName} AS ${queryDef};`;
  dbInstance.run(createViewSql);
  return { success: true, viewName };
}
