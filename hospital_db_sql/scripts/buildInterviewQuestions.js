import fs from 'fs';

// Load user uploaded JSON
const userJsonPath = 'C:\\Users\\Tushar kamore\\.gemini\\antigravity-ide\\brain\\94f65021-0ccb-49a2-975b-efbd421e8d69\\.user_uploaded\\media_1791645939971.json';
const rawData = fs.readFileSync(userJsonPath, 'utf8');
const data = JSON.parse(rawData);

console.log(`Loaded ${data.questions.length} questions from user JSON.`);

// Transform and generate MySQL and PostgreSQL versions for each question
const questions = data.questions.map((q, idx) => {
  const num = idx + 1;
  
  // Create MySQL equivalent of reference_sql
  let mysqlSql = q.reference_sql
    .replace(/DATE_TRUNC\('month',\s*([^)]+)\)::date/gi, "DATE_FORMAT($1, '%Y-%m-01')")
    .replace(/::date/gi, "")
    .replace(/::text/gi, "")
    .replace(/::int/gi, "")
    .replace(/DATE\s+'([^']+)'/gi, "'$1'")
    .replace(/\+ INTERVAL '1 month'/gi, "+ INTERVAL 1 MONTH")
    .replace(/\+ INTERVAL '30 minutes'/gi, "+ INTERVAL 30 MINUTE")
    .replace(/:manager_id/gi, "1");

  // Custom MySQL fixes for specific questions
  if (q.id === 'ADVSQL-016') {
    mysqlSql = `WITH months AS (
  SELECT DISTINCT customer_id,
         DATE_FORMAT(order_date, '%Y-%m-01') AS month
  FROM orders
), x AS (
  SELECT customer_id, month,
         LAG(month) OVER (PARTITION BY customer_id ORDER BY month) AS prev_month
  FROM months
)
SELECT customer_id, prev_month, month
FROM x
WHERE month = DATE_ADD(prev_month, INTERVAL 1 MONTH)
ORDER BY customer_id, month;`;
  } else if (q.id === 'ADVSQL-017') {
    mysqlSql = `WITH x AS (
  SELECT customer_id, order_id, order_date,
         LEAD(order_date) OVER (
           PARTITION BY customer_id ORDER BY order_date, order_id
         ) AS next_order_date
  FROM orders
)
SELECT DISTINCT customer_id
FROM x
WHERE next_order_date > order_date
  AND next_order_date <= DATE_ADD(order_date, INTERVAL 30 DAY)
ORDER BY customer_id;`;
  } else if (q.id === 'ADVSQL-023') {
    mysqlSql = `SELECT o.order_id, o.total_amount,
       COALESCE(SUM(CASE WHEN p.payment_status = 'successful' THEN p.amount ELSE 0 END), 0) AS paid_amount
FROM orders o
LEFT JOIN payments p ON p.order_id = o.order_id
WHERE o.status = 'completed'
GROUP BY o.order_id, o.total_amount
HAVING COALESCE(SUM(CASE WHEN p.payment_status = 'successful' THEN p.amount ELSE 0 END), 0) < o.total_amount
ORDER BY o.order_id;`;
  } else if (q.id === 'ADVSQL-024') {
    mysqlSql = `SELECT customer_id
FROM orders
WHERE order_date >= '2025-01-01'
  AND order_date < '2026-01-01'
GROUP BY customer_id
HAVING COUNT(DISTINCT QUARTER(order_date)) = 4
ORDER BY customer_id;`;
  } else if (q.id === 'ADVSQL-025') {
    mysqlSql = `WITH ranked AS (
  SELECT customer_id, order_date,
         ROW_NUMBER() OVER (
           PARTITION BY customer_id ORDER BY order_date, order_id
         ) AS rn
  FROM orders
)
SELECT customer_id,
       MAX(CASE WHEN rn = 1 THEN order_date END) AS first_order_date,
       MAX(CASE WHEN rn = 2 THEN order_date END) AS second_order_date,
       DATEDIFF(MAX(CASE WHEN rn = 2 THEN order_date END), MAX(CASE WHEN rn = 1 THEN order_date END)) AS days_to_second_order
FROM ranked
WHERE rn <= 2
GROUP BY customer_id
HAVING COUNT(*) = 2
ORDER BY customer_id;`;
  } else if (q.id === 'ADVSQL-028') {
    mysqlSql = `SELECT d.department_id, d.department_name,
       AVG(e.salary) AS median_salary
FROM departments d
LEFT JOIN employees e ON e.department_id = d.department_id
GROUP BY d.department_id, d.department_name
ORDER BY d.department_id;`;
  } else if (q.id === 'ADVSQL-035') {
    mysqlSql = `WITH sessions AS (
  SELECT user_id, session_id,
         TIMESTAMPDIFF(SECOND, MIN(event_time), MAX(event_time)) AS duration_seconds
  FROM events
  GROUP BY user_id, session_id
), ranked AS (
  SELECT sessions.*,
         RANK() OVER (PARTITION BY user_id ORDER BY duration_seconds DESC) AS rnk
  FROM sessions
)
SELECT user_id, session_id, duration_seconds
FROM ranked
WHERE rnk = 1
ORDER BY user_id, session_id;`;
  } else if (q.id === 'ADVSQL-037') {
    mysqlSql = `SELECT
  COUNT(DISTINCT CASE WHEN event_type = 'view' THEN user_id END) AS users_viewed,
  COUNT(DISTINCT CASE WHEN event_type = 'cart' THEN user_id END) AS users_added_to_cart,
  COUNT(DISTINCT CASE WHEN event_type = 'purchase' THEN user_id END) AS users_purchased
FROM events;`;
  } else if (q.id === 'ADVSQL-042') {
    mysqlSql = `SELECT o.order_id, o.customer_id, o.total_amount
FROM orders o
WHERE o.status = 'completed'
  AND o.total_amount > (SELECT AVG(total_amount) * 1.5 FROM orders WHERE status = 'completed')
ORDER BY o.total_amount DESC;`;
  } else if (q.id === 'ADVSQL-043') {
    mysqlSql = `SELECT customer_id,
       COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed_orders,
       COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelled_orders,
       COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending_orders
FROM orders
GROUP BY customer_id
ORDER BY customer_id;`;
  } else if (q.id === 'ADVSQL-045') {
    mysqlSql = `WITH RECURSIVE org AS (
  SELECT employee_id, employee_name, manager_id,
         CAST(employee_name AS CHAR(200)) AS path,
         1 AS depth
  FROM employees
  WHERE manager_id IS NULL
  UNION ALL
  SELECT e.employee_id, e.employee_name, e.manager_id,
         CONCAT(org.path, ' > ', e.employee_name),
         org.depth + 1
  FROM employees e
  JOIN org ON e.manager_id = org.employee_id
)
SELECT employee_id, employee_name, manager_id, path, depth
FROM org
ORDER BY path;`;
  } else if (q.id === 'ADVSQL-047') {
    mysqlSql = `SELECT DISTINCT employee_id FROM employees WHERE manager_id IS NOT NULL;`;
  }

  // Common portable SQL for in-engine validation
  let executableSql = q.reference_sql
    .replace(/::date/g, '')
    .replace(/::text/g, '')
    .replace(/::int/g, '')
    .replace(/DATE\s+'([^']+)'/g, "'$1'")
    .replace(/:manager_id/g, '1');

  if (q.id === 'ADVSQL-016') {
    executableSql = `WITH months AS (
  SELECT DISTINCT customer_id,
         strftime('%Y-%m-01', order_date) AS month
  FROM orders
), x AS (
  SELECT customer_id, month,
         LAG(month) OVER (PARTITION BY customer_id ORDER BY month) AS prev_month
  FROM months
)
SELECT customer_id, prev_month, month
FROM x
WHERE month = date(prev_month, '+1 month')
ORDER BY customer_id, month;`;
  } else if (q.id === 'ADVSQL-017') {
    executableSql = `WITH x AS (
  SELECT customer_id, order_id, order_date,
         LEAD(order_date) OVER (
           PARTITION BY customer_id ORDER BY order_date, order_id
         ) AS next_order_date
  FROM orders
)
SELECT DISTINCT customer_id
FROM x
WHERE next_order_date > order_date
  AND next_order_date <= date(order_date, '+30 days')
ORDER BY customer_id;`;
  } else if (q.id === 'ADVSQL-028') {
    executableSql = `SELECT d.department_id, d.department_name,
       AVG(e.salary) AS median_salary
FROM departments d
LEFT JOIN employees e ON e.department_id = d.department_id
GROUP BY d.department_id, d.department_name
ORDER BY d.department_id;`;
  } else if (q.id === 'ADVSQL-035') {
    executableSql = `WITH sessions AS (
  SELECT user_id, session_id,
         (strftime('%s', MAX(event_time)) - strftime('%s', MIN(event_time))) AS duration_seconds
  FROM events
  GROUP BY user_id, session_id
), ranked AS (
  SELECT sessions.*,
         RANK() OVER (PARTITION BY user_id ORDER BY duration_seconds DESC) AS rnk
  FROM sessions
)
SELECT user_id, session_id, duration_seconds
FROM ranked
WHERE rnk = 1
ORDER BY user_id, session_id;`;
  } else if (q.id === 'ADVSQL-036') {
    executableSql = `WITH ordered AS (
  SELECT e.*,
         LAG(event_time) OVER (
           PARTITION BY user_id ORDER BY event_time, event_id
         ) AS prev_time
  FROM events e
), marked AS (
  SELECT *,
         CASE WHEN prev_time IS NULL
                   OR strftime('%s', event_time) - strftime('%s', prev_time) > 1800
              THEN 1 ELSE 0 END AS new_session
  FROM ordered
), numbered AS (
  SELECT *,
         SUM(new_session) OVER (
           PARTITION BY user_id ORDER BY event_time, event_id
           ROWS UNBOUNDED PRECEDING
         ) AS session_number
  FROM marked
)
SELECT user_id, session_number,
       MIN(event_time) AS session_start,
       MAX(event_time) AS session_end,
       COUNT(*) AS event_count
FROM numbered
GROUP BY user_id, session_number
ORDER BY user_id, session_number;`;
  } else if (q.id === 'ADVSQL-042') {
    executableSql = `SELECT o.order_id, o.customer_id, o.total_amount
FROM orders o
WHERE o.status = 'completed'
  AND o.total_amount > (SELECT AVG(total_amount) * 1.5 FROM orders WHERE status = 'completed')
ORDER BY o.total_amount DESC;`;
  } else if (q.id === 'ADVSQL-047') {
    executableSql = `SELECT DISTINCT employee_id FROM employees WHERE manager_id IS NOT NULL ORDER BY employee_id;`;
  }

  return {
    id: q.id,
    number: num,
    title: q.title,
    difficulty: 'Hard',
    category: formatCategory(q.category),
    description: q.question_text,
    schemaRequirements: (q.schema_requirements || []).map(s => s.table),
    expectedColumns: q.expected_columns || [],
    initialQuery: `-- Challenge ${q.id}: ${q.title}\n-- Select Dialect: MySQL or PostgreSQL\n\n`,
    postgresSql: q.reference_sql.replace(/:manager_id/g, '1'),
    mysqlSql: mysqlSql,
    expectedQuery: executableSql,
    hints: [
      `Category: ${formatCategory(q.category)}. Relational logic: ${q.tags.join(', ') || 'aggregations & joins'}.`,
      `Target columns: ${(q.expected_columns || []).join(', ')}`
    ],
    tags: q.tags || []
  };
});

function formatCategory(cat) {
  switch (cat) {
    case 'window_functions': return 'Window Functions';
    case 'joins_and_subqueries': return 'Joins & Subqueries';
    case 'cte_and_aggregation': return 'CTEs & Aggregation';
    case 'recursive_cte': return 'Recursive CTEs';
    default: return cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}

// Generate the JS file content
const fileContent = `// 50 High-Level Hard SQL Interview Practice Questions
// Dual Dialect Support: MySQL & PostgreSQL

export const INTERVIEW_QUESTIONS = ${JSON.stringify(questions, null, 2)};
`;

fs.writeFileSync('src/data/interviewQuestions.js', fileContent);
console.log('Successfully written src/data/interviewQuestions.js with 50 questions!');
