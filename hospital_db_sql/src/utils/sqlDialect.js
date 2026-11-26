/**
 * Shared MySQL & PostgreSQL dialect normalization and SQLite WASM compatibility functions.
 */
export function normalizeDialectQuery(sql) {
  if (!sql) return '';
  let q = sql;

  // Normalize Postgres typecasts & date truncation
  q = q.replace(/DATE_TRUNC\('month',\s*([^)]+)\)::date/gi, "date_trunc('month', $1)");
  q = q.replace(/::date/gi, '');
  q = q.replace(/::text/gi, '');
  q = q.replace(/::int/gi, '');
  q = q.replace(/::numeric/gi, '');
  q = q.replace(/DATE\s+'([^']+)'/gi, "'$1'");
  q = q.replace(/:manager_id/gi, '1');

  // Normalize MySQL DATE_ADD(expr, INTERVAL N UNIT)
  q = q.replace(
    /DATE_ADD\(\s*([^,]+?)\s*,\s*INTERVAL\s+(\d+)\s+(YEAR|MONTH|DAY|HOUR|MINUTE|SECOND)S?\s*\)/gi,
    (_m, expr, amount, unit) => {
      const u = unit.toLowerCase();
      const fn = ['hour', 'minute', 'second'].includes(u) ? 'datetime' : 'date';
      return `${fn}(${expr.trim()}, '+${amount} ${u}s')`;
    }
  );

  // Normalize Postgres (expr + INTERVAL 'N unit') and MySQL expr + INTERVAL N UNIT
  q = q.replace(
    /\(\s*([^()]+?)\s*\+\s*INTERVAL\s+'(\d+)\s+(year|month|day|hour|minute|second)s?'\s*\)/gi,
    (_m, expr, amount, unit) => {
      const u = unit.toLowerCase();
      const fn = ['hour', 'minute', 'second'].includes(u) ? 'datetime' : 'date';
      return `${fn}(${expr.trim()}, '+${amount} ${u}s')`;
    }
  );
  q = q.replace(
    /([a-zA-Z0-9_.]+)\s*\+\s*INTERVAL\s+'?(\d+)\s+(year|month|day|hour|minute|second)s?'?/gi,
    (_m, expr, amount, unit) => {
      const u = unit.toLowerCase();
      const fn = ['hour', 'minute', 'second'].includes(u) ? 'datetime' : 'date';
      return `${fn}(${expr.trim()}, '+${amount} ${u}s')`;
    }
  );

  // Normalize MySQL TIMESTAMPDIFF(SECOND, start, end) and Postgres EXTRACT(EPOCH FROM (end - start))
  q = q.replace(
    /TIMESTAMPDIFF\s*\(\s*SECOND\s*,\s*((?:[^(),]|\([^)]*\))+?)\s*,\s*((?:[^(),]|\([^)]*\))+?)\s*\)/gi,
    (_m, startExpr, endExpr) =>
      `CAST(ROUND((julianday(${endExpr.trim()}) - julianday(${startExpr.trim()})) * 86400) AS INTEGER)`
  );
  q = q.replace(
    /EXTRACT\s*\(\s*EPOCH\s+FROM\s+\(\s*((?:[^()-]|\([^)]*\))+?)\s*-\s*((?:[^()-]|\([^)]*\))+?)\s*\)\s*\)/gi,
    (_m, endExpr, startExpr) =>
      `CAST(ROUND((julianday(${endExpr.trim()}) - julianday(${startExpr.trim()})) * 86400) AS INTEGER)`
  );

  // Normalize EXTRACT(QUARTER FROM expr)
  q = q.replace(/EXTRACT\s*\(\s*QUARTER\s+FROM\s+([^)]+)\)/gi, 'quarter($1)');

  return q;
}

export function registerCompatibilityFunctions(db) {
  try {
    db.create_function('date_trunc', (_part, d) => (d ? String(d).substring(0, 7) + '-01' : null));
    db.create_function('bool_and', (val) => (val ? 1 : 0));
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
    db.create_function('date_format', (d, _fmt) => (d ? String(d).substring(0, 7) + '-01' : null));
    db.create_function('concat', (...args) => args.join(''));
    db.create_function('if', (c, a, b) => (c ? a : b));
  } catch {
    // Ignore duplicate function creation
  }
}
