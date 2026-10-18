import initSqlJs from 'sql.js';
import { INTERVIEW_INITIAL_SQL } from './interviewDbSql.js';
import { INTERVIEW_QUESTIONS } from '../src/data/interviewQuestions.js';

async function testAll() {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  db.run('PRAGMA case_sensitive_like = OFF;');
  db.run(INTERVIEW_INITIAL_SQL);

  // Register compatibility functions for MySQL & Postgres
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

  let passed = 0;
  let failed = 0;
  const failures = [];

  for (const q of INTERVIEW_QUESTIONS) {
    let queryToTest = q.expectedQuery;

    // Standard engine normalizations
    queryToTest = queryToTest
      .replace(/DATE_TRUNC\('month',\s*([^)]+)\)::date/gi, "DATE_TRUNC('month', $1)")
      .replace(/::date/gi, '')
      .replace(/::text/gi, '')
      .replace(/::int/gi, '')
      .replace(/DATE\s+'([^']+)'/gi, "'$1'")
      .replace(/:manager_id/gi, '1')
      .replace(/EXTRACT\s*\(\s*QUARTER\s+FROM\s+([^)]+)\)/gi, "quarter($1)");

    try {
      const res = db.exec(queryToTest);
      const rowCount = res && res[0] ? res[0].values.length : 0;
      console.log(`[PASS] ${q.id}: ${q.title} (${rowCount} rows)`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${q.id}: ${q.title} - ${err.message}`);
      failed++;
      failures.push({ id: q.id, title: q.title, error: err.message, sql: queryToTest });
    }
  }

  console.log(`\n===========================================`);
  console.log(`RESULTS: ${passed} PASSED | ${failed} FAILED out of ${INTERVIEW_QUESTIONS.length}`);
  console.log(`===========================================`);
  if (failed > 0) process.exit(1);
}

testAll().catch(console.error);
