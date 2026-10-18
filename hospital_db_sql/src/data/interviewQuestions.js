// 50 High-Level Hard SQL Interview Practice Questions
// Dual Dialect Support: MySQL & PostgreSQL

export const INTERVIEW_QUESTIONS = [
  {
    "id": "ADVSQL-001",
    "number": 1,
    "title": "Department-wise second-highest salary",
    "difficulty": "Hard",
    "category": "Window Functions",
    "description": "Return each department's second-highest distinct salary and department name. Skip departments with fewer than two distinct salaries.",
    "schemaRequirements": [
      "employees",
      "departments"
    ],
    "expectedColumns": [
      "department_name",
      "second_highest_salary"
    ],
    "initialQuery": "-- Challenge ADVSQL-001: Department-wise second-highest salary\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "WITH ranked AS (\n  SELECT e.department_id, e.salary,\n         DENSE_RANK() OVER (\n           PARTITION BY e.department_id ORDER BY e.salary DESC\n         ) AS salary_rank\n  FROM employees e\n)\nSELECT d.department_name, r.salary AS second_highest_salary\nFROM ranked r\nJOIN departments d ON d.department_id = r.department_id\nWHERE r.salary_rank = 2\nORDER BY d.department_name;",
    "mysqlSql": "WITH ranked AS (\n  SELECT e.department_id, e.salary,\n         DENSE_RANK() OVER (\n           PARTITION BY e.department_id ORDER BY e.salary DESC\n         ) AS salary_rank\n  FROM employees e\n)\nSELECT d.department_name, r.salary AS second_highest_salary\nFROM ranked r\nJOIN departments d ON d.department_id = r.department_id\nWHERE r.salary_rank = 2\nORDER BY d.department_name;",
    "expectedQuery": "WITH ranked AS (\n  SELECT e.department_id, e.salary,\n         DENSE_RANK() OVER (\n           PARTITION BY e.department_id ORDER BY e.salary DESC\n         ) AS salary_rank\n  FROM employees e\n)\nSELECT d.department_name, r.salary AS second_highest_salary\nFROM ranked r\nJOIN departments d ON d.department_id = r.department_id\nWHERE r.salary_rank = 2\nORDER BY d.department_name;",
    "hints": [
      "Category: Window Functions. Relational logic: window-functions.",
      "Target columns: department_name, second_highest_salary"
    ],
    "tags": [
      "window-functions"
    ]
  },
  {
    "id": "ADVSQL-002",
    "number": 2,
    "title": "Top three earners per department (ties included)",
    "difficulty": "Hard",
    "category": "Window Functions",
    "description": "Return employees whose salary rank is at most 3 within their department. Ties should share a rank.",
    "schemaRequirements": [
      "employees"
    ],
    "expectedColumns": [
      "employee_id",
      "employee_name",
      "department_id",
      "salary",
      "salary_rank"
    ],
    "initialQuery": "-- Challenge ADVSQL-002: Top three earners per department (ties included)\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "WITH ranked AS (\n  SELECT e.*,\n         DENSE_RANK() OVER (\n           PARTITION BY department_id ORDER BY salary DESC\n         ) AS salary_rank\n  FROM employees e\n)\nSELECT employee_id, employee_name, department_id, salary, salary_rank\nFROM ranked\nWHERE salary_rank <= 3\nORDER BY department_id, salary DESC, employee_id;",
    "mysqlSql": "WITH ranked AS (\n  SELECT e.*,\n         DENSE_RANK() OVER (\n           PARTITION BY department_id ORDER BY salary DESC\n         ) AS salary_rank\n  FROM employees e\n)\nSELECT employee_id, employee_name, department_id, salary, salary_rank\nFROM ranked\nWHERE salary_rank <= 3\nORDER BY department_id, salary DESC, employee_id;",
    "expectedQuery": "WITH ranked AS (\n  SELECT e.*,\n         DENSE_RANK() OVER (\n           PARTITION BY department_id ORDER BY salary DESC\n         ) AS salary_rank\n  FROM employees e\n)\nSELECT employee_id, employee_name, department_id, salary, salary_rank\nFROM ranked\nWHERE salary_rank <= 3\nORDER BY department_id, salary DESC, employee_id;",
    "hints": [
      "Category: Window Functions. Relational logic: window-functions.",
      "Target columns: employee_id, employee_name, department_id, salary, salary_rank"
    ],
    "tags": [
      "window-functions"
    ]
  },
  {
    "id": "ADVSQL-003",
    "number": 3,
    "title": "Employees earning above their department average",
    "difficulty": "Hard",
    "category": "Window Functions",
    "description": "List employees whose salary is greater than the average salary of their own department.",
    "schemaRequirements": [
      "employees"
    ],
    "expectedColumns": [
      "employee_id",
      "employee_name",
      "department_id",
      "salary"
    ],
    "initialQuery": "-- Challenge ADVSQL-003: Employees earning above their department average\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "SELECT employee_id, employee_name, department_id, salary\nFROM (\n  SELECT e.*,\n         AVG(salary) OVER (PARTITION BY department_id) AS dept_avg_salary\n  FROM employees e\n) x\nWHERE salary > dept_avg_salary\nORDER BY department_id, salary DESC;",
    "mysqlSql": "SELECT employee_id, employee_name, department_id, salary\nFROM (\n  SELECT e.*,\n         AVG(salary) OVER (PARTITION BY department_id) AS dept_avg_salary\n  FROM employees e\n) x\nWHERE salary > dept_avg_salary\nORDER BY department_id, salary DESC;",
    "expectedQuery": "SELECT employee_id, employee_name, department_id, salary\nFROM (\n  SELECT e.*,\n         AVG(salary) OVER (PARTITION BY department_id) AS dept_avg_salary\n  FROM employees e\n) x\nWHERE salary > dept_avg_salary\nORDER BY department_id, salary DESC;",
    "hints": [
      "Category: Window Functions. Relational logic: window-functions, aggregation.",
      "Target columns: employee_id, employee_name, department_id, salary"
    ],
    "tags": [
      "window-functions",
      "aggregation"
    ]
  },
  {
    "id": "ADVSQL-004",
    "number": 4,
    "title": "Salary higher than the manager's salary",
    "difficulty": "Hard",
    "category": "Joins & Subqueries",
    "description": "Find employees whose salary exceeds their direct manager's salary.",
    "schemaRequirements": [
      "employees"
    ],
    "expectedColumns": [
      "employee_id",
      "employee_name",
      "salary",
      "manager_name",
      "manager_salary"
    ],
    "initialQuery": "-- Challenge ADVSQL-004: Salary higher than the manager's salary\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "SELECT e.employee_id, e.employee_name, e.salary,\n       m.employee_name AS manager_name, m.salary AS manager_salary\nFROM employees e\nJOIN employees m ON m.employee_id = e.manager_id\nWHERE e.salary > m.salary\nORDER BY e.employee_id;",
    "mysqlSql": "SELECT e.employee_id, e.employee_name, e.salary,\n       m.employee_name AS manager_name, m.salary AS manager_salary\nFROM employees e\nJOIN employees m ON m.employee_id = e.manager_id\nWHERE e.salary > m.salary\nORDER BY e.employee_id;",
    "expectedQuery": "SELECT e.employee_id, e.employee_name, e.salary,\n       m.employee_name AS manager_name, m.salary AS manager_salary\nFROM employees e\nJOIN employees m ON m.employee_id = e.manager_id\nWHERE e.salary > m.salary\nORDER BY e.employee_id;",
    "hints": [
      "Category: Joins & Subqueries. Relational logic: aggregations & joins.",
      "Target columns: employee_id, employee_name, salary, manager_name, manager_salary"
    ],
    "tags": []
  },
  {
    "id": "ADVSQL-005",
    "number": 5,
    "title": "Departments with no employees",
    "difficulty": "Hard",
    "category": "Joins & Subqueries",
    "description": "Return departments that currently have no employee rows.",
    "schemaRequirements": [
      "departments",
      "employees"
    ],
    "expectedColumns": [
      "department_id",
      "department_name"
    ],
    "initialQuery": "-- Challenge ADVSQL-005: Departments with no employees\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "SELECT d.department_id, d.department_name\nFROM departments d\nWHERE NOT EXISTS (\n  SELECT 1 FROM employees e\n  WHERE e.department_id = d.department_id\n)\nORDER BY d.department_id;",
    "mysqlSql": "SELECT d.department_id, d.department_name\nFROM departments d\nWHERE NOT EXISTS (\n  SELECT 1 FROM employees e\n  WHERE e.department_id = d.department_id\n)\nORDER BY d.department_id;",
    "expectedQuery": "SELECT d.department_id, d.department_name\nFROM departments d\nWHERE NOT EXISTS (\n  SELECT 1 FROM employees e\n  WHERE e.department_id = d.department_id\n)\nORDER BY d.department_id;",
    "hints": [
      "Category: Joins & Subqueries. Relational logic: anti-join.",
      "Target columns: department_id, department_name"
    ],
    "tags": [
      "anti-join"
    ]
  },
  {
    "id": "ADVSQL-006",
    "number": 6,
    "title": "Employees with no project assignment",
    "difficulty": "Hard",
    "category": "Joins & Subqueries",
    "description": "Find employees who do not appear in employee_projects.",
    "schemaRequirements": [
      "employees",
      "employee_projects"
    ],
    "expectedColumns": [
      "employee_id",
      "employee_name"
    ],
    "initialQuery": "-- Challenge ADVSQL-006: Employees with no project assignment\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "SELECT e.employee_id, e.employee_name\nFROM employees e\nWHERE NOT EXISTS (\n  SELECT 1 FROM employee_projects ep\n  WHERE ep.employee_id = e.employee_id\n)\nORDER BY e.employee_id;",
    "mysqlSql": "SELECT e.employee_id, e.employee_name\nFROM employees e\nWHERE NOT EXISTS (\n  SELECT 1 FROM employee_projects ep\n  WHERE ep.employee_id = e.employee_id\n)\nORDER BY e.employee_id;",
    "expectedQuery": "SELECT e.employee_id, e.employee_name\nFROM employees e\nWHERE NOT EXISTS (\n  SELECT 1 FROM employee_projects ep\n  WHERE ep.employee_id = e.employee_id\n)\nORDER BY e.employee_id;",
    "hints": [
      "Category: Joins & Subqueries. Relational logic: anti-join.",
      "Target columns: employee_id, employee_name"
    ],
    "tags": [
      "anti-join"
    ]
  },
  {
    "id": "ADVSQL-007",
    "number": 7,
    "title": "Projects with every department employee assigned",
    "difficulty": "Hard",
    "category": "Joins & Subqueries",
    "description": "Return projects owned by a department for which every employee in that department is assigned to the project. Departments with zero employees are excluded.",
    "schemaRequirements": [
      "projects",
      "employees",
      "employee_projects"
    ],
    "expectedColumns": [
      "project_id",
      "project_name",
      "department_id"
    ],
    "initialQuery": "-- Challenge ADVSQL-007: Projects with every department employee assigned\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "SELECT p.project_id, p.project_name, p.department_id\nFROM projects p\nWHERE EXISTS (\n  SELECT 1 FROM employees e\n  WHERE e.department_id = p.department_id\n)\nAND NOT EXISTS (\n  SELECT 1\n  FROM employees e\n  WHERE e.department_id = p.department_id\n    AND NOT EXISTS (\n      SELECT 1 FROM employee_projects ep\n      WHERE ep.project_id = p.project_id\n        AND ep.employee_id = e.employee_id\n    )\n)\nORDER BY p.project_id;",
    "mysqlSql": "SELECT p.project_id, p.project_name, p.department_id\nFROM projects p\nWHERE EXISTS (\n  SELECT 1 FROM employees e\n  WHERE e.department_id = p.department_id\n)\nAND NOT EXISTS (\n  SELECT 1\n  FROM employees e\n  WHERE e.department_id = p.department_id\n    AND NOT EXISTS (\n      SELECT 1 FROM employee_projects ep\n      WHERE ep.project_id = p.project_id\n        AND ep.employee_id = e.employee_id\n    )\n)\nORDER BY p.project_id;",
    "expectedQuery": "SELECT p.project_id, p.project_name, p.department_id\nFROM projects p\nWHERE EXISTS (\n  SELECT 1 FROM employees e\n  WHERE e.department_id = p.department_id\n)\nAND NOT EXISTS (\n  SELECT 1\n  FROM employees e\n  WHERE e.department_id = p.department_id\n    AND NOT EXISTS (\n      SELECT 1 FROM employee_projects ep\n      WHERE ep.project_id = p.project_id\n        AND ep.employee_id = e.employee_id\n    )\n)\nORDER BY p.project_id;",
    "hints": [
      "Category: Joins & Subqueries. Relational logic: anti-join.",
      "Target columns: project_id, project_name, department_id"
    ],
    "tags": [
      "anti-join"
    ]
  },
  {
    "id": "ADVSQL-008",
    "number": 8,
    "title": "Project effort ranking",
    "difficulty": "Hard",
    "category": "Window Functions",
    "description": "Rank projects by total recorded hours, highest first; include projects with no assignments and show zero hours.",
    "schemaRequirements": [
      "projects",
      "employee_projects"
    ],
    "expectedColumns": [
      "project_id",
      "project_name",
      "total_hours",
      "effort_rank"
    ],
    "initialQuery": "-- Challenge ADVSQL-008: Project effort ranking\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "SELECT p.project_id, p.project_name,\n       COALESCE(SUM(ep.hours_worked), 0) AS total_hours,\n       DENSE_RANK() OVER (\n         ORDER BY COALESCE(SUM(ep.hours_worked), 0) DESC\n       ) AS effort_rank\nFROM projects p\nLEFT JOIN employee_projects ep ON ep.project_id = p.project_id\nGROUP BY p.project_id, p.project_name\nORDER BY effort_rank, p.project_id;",
    "mysqlSql": "SELECT p.project_id, p.project_name,\n       COALESCE(SUM(ep.hours_worked), 0) AS total_hours,\n       DENSE_RANK() OVER (\n         ORDER BY COALESCE(SUM(ep.hours_worked), 0) DESC\n       ) AS effort_rank\nFROM projects p\nLEFT JOIN employee_projects ep ON ep.project_id = p.project_id\nGROUP BY p.project_id, p.project_name\nORDER BY effort_rank, p.project_id;",
    "expectedQuery": "SELECT p.project_id, p.project_name,\n       COALESCE(SUM(ep.hours_worked), 0) AS total_hours,\n       DENSE_RANK() OVER (\n         ORDER BY COALESCE(SUM(ep.hours_worked), 0) DESC\n       ) AS effort_rank\nFROM projects p\nLEFT JOIN employee_projects ep ON ep.project_id = p.project_id\nGROUP BY p.project_id, p.project_name\nORDER BY effort_rank, p.project_id;",
    "hints": [
      "Category: Window Functions. Relational logic: window-functions, aggregation.",
      "Target columns: project_id, project_name, total_hours, effort_rank"
    ],
    "tags": [
      "window-functions",
      "aggregation"
    ]
  },
  {
    "id": "ADVSQL-009",
    "number": 9,
    "title": "Employees assigned to at least three projects",
    "difficulty": "Hard",
    "category": "Joins & Subqueries",
    "description": "List employees assigned to three or more distinct projects and the project count.",
    "schemaRequirements": [
      "employees",
      "employee_projects"
    ],
    "expectedColumns": [
      "employee_id",
      "employee_name",
      "project_count"
    ],
    "initialQuery": "-- Challenge ADVSQL-009: Employees assigned to at least three projects\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "SELECT e.employee_id, e.employee_name,\n       COUNT(DISTINCT ep.project_id) AS project_count\nFROM employees e\nJOIN employee_projects ep ON ep.employee_id = e.employee_id\nGROUP BY e.employee_id, e.employee_name\nHAVING COUNT(DISTINCT ep.project_id) >= 3\nORDER BY project_count DESC, e.employee_id;",
    "mysqlSql": "SELECT e.employee_id, e.employee_name,\n       COUNT(DISTINCT ep.project_id) AS project_count\nFROM employees e\nJOIN employee_projects ep ON ep.employee_id = e.employee_id\nGROUP BY e.employee_id, e.employee_name\nHAVING COUNT(DISTINCT ep.project_id) >= 3\nORDER BY project_count DESC, e.employee_id;",
    "expectedQuery": "SELECT e.employee_id, e.employee_name,\n       COUNT(DISTINCT ep.project_id) AS project_count\nFROM employees e\nJOIN employee_projects ep ON ep.employee_id = e.employee_id\nGROUP BY e.employee_id, e.employee_name\nHAVING COUNT(DISTINCT ep.project_id) >= 3\nORDER BY project_count DESC, e.employee_id;",
    "hints": [
      "Category: Joins & Subqueries. Relational logic: aggregation.",
      "Target columns: employee_id, employee_name, project_count"
    ],
    "tags": [
      "aggregation"
    ]
  },
  {
    "id": "ADVSQL-010",
    "number": 10,
    "title": "Projects with above-average hours",
    "difficulty": "Hard",
    "category": "CTEs & Aggregation",
    "description": "Find projects whose total assigned hours exceed the average total hours across all projects. Projects with no assignments count as zero.",
    "schemaRequirements": [
      "projects",
      "employee_projects"
    ],
    "expectedColumns": [
      "*"
    ],
    "initialQuery": "-- Challenge ADVSQL-010: Projects with above-average hours\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "WITH project_hours AS (\n  SELECT p.project_id, p.project_name,\n         COALESCE(SUM(ep.hours_worked), 0) AS total_hours\n  FROM projects p\n  LEFT JOIN employee_projects ep ON ep.project_id = p.project_id\n  GROUP BY p.project_id, p.project_name\n)\nSELECT *\nFROM project_hours\nWHERE total_hours > (SELECT AVG(total_hours) FROM project_hours)\nORDER BY total_hours DESC;",
    "mysqlSql": "WITH project_hours AS (\n  SELECT p.project_id, p.project_name,\n         COALESCE(SUM(ep.hours_worked), 0) AS total_hours\n  FROM projects p\n  LEFT JOIN employee_projects ep ON ep.project_id = p.project_id\n  GROUP BY p.project_id, p.project_name\n)\nSELECT *\nFROM project_hours\nWHERE total_hours > (SELECT AVG(total_hours) FROM project_hours)\nORDER BY total_hours DESC;",
    "expectedQuery": "WITH project_hours AS (\n  SELECT p.project_id, p.project_name,\n         COALESCE(SUM(ep.hours_worked), 0) AS total_hours\n  FROM projects p\n  LEFT JOIN employee_projects ep ON ep.project_id = p.project_id\n  GROUP BY p.project_id, p.project_name\n)\nSELECT *\nFROM project_hours\nWHERE total_hours > (SELECT AVG(total_hours) FROM project_hours)\nORDER BY total_hours DESC;",
    "hints": [
      "Category: CTEs & Aggregation. Relational logic: aggregation.",
      "Target columns: *"
    ],
    "tags": [
      "aggregation"
    ]
  },
  {
    "id": "ADVSQL-011",
    "number": 11,
    "title": "Customers who never placed a completed order",
    "difficulty": "Hard",
    "category": "Joins & Subqueries",
    "description": "Return customers who have no order with status = 'completed'.",
    "schemaRequirements": [
      "customers",
      "orders"
    ],
    "expectedColumns": [
      "customer_id",
      "customer_name"
    ],
    "initialQuery": "-- Challenge ADVSQL-011: Customers who never placed a completed order\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "SELECT c.customer_id, c.customer_name\nFROM customers c\nWHERE NOT EXISTS (\n  SELECT 1 FROM orders o\n  WHERE o.customer_id = c.customer_id\n    AND o.status = 'completed'\n)\nORDER BY c.customer_id;",
    "mysqlSql": "SELECT c.customer_id, c.customer_name\nFROM customers c\nWHERE NOT EXISTS (\n  SELECT 1 FROM orders o\n  WHERE o.customer_id = c.customer_id\n    AND o.status = 'completed'\n)\nORDER BY c.customer_id;",
    "expectedQuery": "SELECT c.customer_id, c.customer_name\nFROM customers c\nWHERE NOT EXISTS (\n  SELECT 1 FROM orders o\n  WHERE o.customer_id = c.customer_id\n    AND o.status = 'completed'\n)\nORDER BY c.customer_id;",
    "hints": [
      "Category: Joins & Subqueries. Relational logic: anti-join.",
      "Target columns: customer_id, customer_name"
    ],
    "tags": [
      "anti-join"
    ]
  },
  {
    "id": "ADVSQL-012",
    "number": 12,
    "title": "Monthly revenue with month-over-month change",
    "difficulty": "Hard",
    "category": "Window Functions",
    "description": "For completed orders, calculate monthly revenue and the absolute change from the previous calendar month represented in the result.",
    "schemaRequirements": [
      "orders"
    ],
    "expectedColumns": [
      "month",
      "revenue",
      "revenue_change"
    ],
    "initialQuery": "-- Challenge ADVSQL-012: Monthly revenue with month-over-month change\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "WITH monthly AS (\n  SELECT DATE_TRUNC('month', order_date)::date AS month,\n         SUM(total_amount) AS revenue\n  FROM orders\n  WHERE status = 'completed'\n  GROUP BY DATE_TRUNC('month', order_date)::date\n)\nSELECT month, revenue,\n       revenue - LAG(revenue) OVER (ORDER BY month) AS revenue_change\nFROM monthly\nORDER BY month;",
    "mysqlSql": "WITH monthly AS (\n  SELECT DATE_FORMAT(order_date, '%Y-%m-01') AS month,\n         SUM(total_amount) AS revenue\n  FROM orders\n  WHERE status = 'completed'\n  GROUP BY DATE_FORMAT(order_date, '%Y-%m-01')\n)\nSELECT month, revenue,\n       revenue - LAG(revenue) OVER (ORDER BY month) AS revenue_change\nFROM monthly\nORDER BY month;",
    "expectedQuery": "WITH monthly AS (\n  SELECT DATE_TRUNC('month', order_date) AS month,\n         SUM(total_amount) AS revenue\n  FROM orders\n  WHERE status = 'completed'\n  GROUP BY DATE_TRUNC('month', order_date)\n)\nSELECT month, revenue,\n       revenue - LAG(revenue) OVER (ORDER BY month) AS revenue_change\nFROM monthly\nORDER BY month;",
    "hints": [
      "Category: Window Functions. Relational logic: window-functions, aggregation.",
      "Target columns: month, revenue, revenue_change"
    ],
    "tags": [
      "window-functions",
      "aggregation"
    ]
  },
  {
    "id": "ADVSQL-013",
    "number": 13,
    "title": "Running revenue total",
    "difficulty": "Hard",
    "category": "Window Functions",
    "description": "Show completed-order revenue by order date and the cumulative revenue over time.",
    "schemaRequirements": [
      "orders"
    ],
    "expectedColumns": [
      "order_date",
      "daily_revenue",
      "running_revenue"
    ],
    "initialQuery": "-- Challenge ADVSQL-013: Running revenue total\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "WITH daily AS (\n  SELECT order_date, SUM(total_amount) AS daily_revenue\n  FROM orders\n  WHERE status = 'completed'\n  GROUP BY order_date\n)\nSELECT order_date, daily_revenue,\n       SUM(daily_revenue) OVER (\n         ORDER BY order_date\n         ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n       ) AS running_revenue\nFROM daily\nORDER BY order_date;",
    "mysqlSql": "WITH daily AS (\n  SELECT order_date, SUM(total_amount) AS daily_revenue\n  FROM orders\n  WHERE status = 'completed'\n  GROUP BY order_date\n)\nSELECT order_date, daily_revenue,\n       SUM(daily_revenue) OVER (\n         ORDER BY order_date\n         ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n       ) AS running_revenue\nFROM daily\nORDER BY order_date;",
    "expectedQuery": "WITH daily AS (\n  SELECT order_date, SUM(total_amount) AS daily_revenue\n  FROM orders\n  WHERE status = 'completed'\n  GROUP BY order_date\n)\nSELECT order_date, daily_revenue,\n       SUM(daily_revenue) OVER (\n         ORDER BY order_date\n         ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n       ) AS running_revenue\nFROM daily\nORDER BY order_date;",
    "hints": [
      "Category: Window Functions. Relational logic: window-functions, aggregation.",
      "Target columns: order_date, daily_revenue, running_revenue"
    ],
    "tags": [
      "window-functions",
      "aggregation"
    ]
  },
  {
    "id": "ADVSQL-014",
    "number": 14,
    "title": "Seven-day rolling order revenue",
    "difficulty": "Hard",
    "category": "CTEs & Aggregation",
    "description": "For every order date with completed orders, calculate revenue over the current date and six preceding calendar days.",
    "schemaRequirements": [
      "orders"
    ],
    "expectedColumns": [
      "order_date",
      "revenue",
      "rolling_7_day_revenue"
    ],
    "initialQuery": "-- Challenge ADVSQL-014: Seven-day rolling order revenue\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "WITH daily AS (\n  SELECT order_date, SUM(total_amount) AS revenue\n  FROM orders\n  WHERE status = 'completed'\n  GROUP BY order_date\n)\nSELECT d1.order_date, d1.revenue,\n       (SELECT SUM(d2.revenue)\n        FROM daily d2\n        WHERE d2.order_date BETWEEN d1.order_date - 6 AND d1.order_date\n       ) AS rolling_7_day_revenue\nFROM daily d1\nORDER BY d1.order_date;",
    "mysqlSql": "WITH daily AS (\n  SELECT order_date, SUM(total_amount) AS revenue\n  FROM orders\n  WHERE status = 'completed'\n  GROUP BY order_date\n)\nSELECT d1.order_date, d1.revenue,\n       (SELECT SUM(d2.revenue)\n        FROM daily d2\n        WHERE d2.order_date BETWEEN d1.order_date - 6 AND d1.order_date\n       ) AS rolling_7_day_revenue\nFROM daily d1\nORDER BY d1.order_date;",
    "expectedQuery": "WITH daily AS (\n  SELECT order_date, SUM(total_amount) AS revenue\n  FROM orders\n  WHERE status = 'completed'\n  GROUP BY order_date\n)\nSELECT d1.order_date, d1.revenue,\n       (SELECT SUM(d2.revenue)\n        FROM daily d2\n        WHERE d2.order_date BETWEEN d1.order_date - 6 AND d1.order_date\n       ) AS rolling_7_day_revenue\nFROM daily d1\nORDER BY d1.order_date;",
    "hints": [
      "Category: CTEs & Aggregation. Relational logic: aggregation.",
      "Target columns: order_date, revenue, rolling_7_day_revenue"
    ],
    "tags": [
      "aggregation"
    ]
  },
  {
    "id": "ADVSQL-015",
    "number": 15,
    "title": "Largest order per customer",
    "difficulty": "Hard",
    "category": "Window Functions",
    "description": "Return each customer's largest order; if multiple orders tie for the maximum, return all tied orders.",
    "schemaRequirements": [
      "orders"
    ],
    "expectedColumns": [
      "customer_id",
      "order_id",
      "order_date",
      "total_amount"
    ],
    "initialQuery": "-- Challenge ADVSQL-015: Largest order per customer\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "WITH ranked AS (\n  SELECT o.*,\n         RANK() OVER (\n           PARTITION BY customer_id ORDER BY total_amount DESC\n         ) AS rnk\n  FROM orders o\n)\nSELECT customer_id, order_id, order_date, total_amount\nFROM ranked\nWHERE rnk = 1\nORDER BY customer_id, order_id;",
    "mysqlSql": "WITH ranked AS (\n  SELECT o.*,\n         RANK() OVER (\n           PARTITION BY customer_id ORDER BY total_amount DESC\n         ) AS rnk\n  FROM orders o\n)\nSELECT customer_id, order_id, order_date, total_amount\nFROM ranked\nWHERE rnk = 1\nORDER BY customer_id, order_id;",
    "expectedQuery": "WITH ranked AS (\n  SELECT o.*,\n         RANK() OVER (\n           PARTITION BY customer_id ORDER BY total_amount DESC\n         ) AS rnk\n  FROM orders o\n)\nSELECT customer_id, order_id, order_date, total_amount\nFROM ranked\nWHERE rnk = 1\nORDER BY customer_id, order_id;",
    "hints": [
      "Category: Window Functions. Relational logic: window-functions.",
      "Target columns: customer_id, order_id, order_date, total_amount"
    ],
    "tags": [
      "window-functions"
    ]
  },
  {
    "id": "ADVSQL-016",
    "number": 16,
    "title": "Customers with consecutive monthly purchases",
    "difficulty": "Hard",
    "category": "Window Functions",
    "description": "Find customers who placed at least one order in two or more consecutive calendar months. Return each customer and the pair of consecutive months.",
    "schemaRequirements": [
      "orders"
    ],
    "expectedColumns": [
      "customer_id",
      "prev_month",
      "month"
    ],
    "initialQuery": "-- Challenge ADVSQL-016: Customers with consecutive monthly purchases\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "WITH months AS (\n  SELECT DISTINCT customer_id,\n         DATE_TRUNC('month', order_date)::date AS month\n  FROM orders\n), x AS (\n  SELECT customer_id, month,\n         LAG(month) OVER (PARTITION BY customer_id ORDER BY month) AS prev_month\n  FROM months\n)\nSELECT customer_id, prev_month, month\nFROM x\nWHERE month = (prev_month + INTERVAL '1 month')::date\nORDER BY customer_id, month;",
    "mysqlSql": "WITH months AS (\n  SELECT DISTINCT customer_id,\n         DATE_FORMAT(order_date, '%Y-%m-01') AS month\n  FROM orders\n), x AS (\n  SELECT customer_id, month,\n         LAG(month) OVER (PARTITION BY customer_id ORDER BY month) AS prev_month\n  FROM months\n)\nSELECT customer_id, prev_month, month\nFROM x\nWHERE month = DATE_ADD(prev_month, INTERVAL 1 MONTH)\nORDER BY customer_id, month;",
    "expectedQuery": "WITH months AS (\n  SELECT DISTINCT customer_id,\n         strftime('%Y-%m-01', order_date) AS month\n  FROM orders\n), x AS (\n  SELECT customer_id, month,\n         LAG(month) OVER (PARTITION BY customer_id ORDER BY month) AS prev_month\n  FROM months\n)\nSELECT customer_id, prev_month, month\nFROM x\nWHERE month = date(prev_month, '+1 month')\nORDER BY customer_id, month;",
    "hints": [
      "Category: Window Functions. Relational logic: window-functions.",
      "Target columns: customer_id, prev_month, month"
    ],
    "tags": [
      "window-functions"
    ]
  },
  {
    "id": "ADVSQL-017",
    "number": 17,
    "title": "Repeat customers within 30 days",
    "difficulty": "Hard",
    "category": "Window Functions",
    "description": "Find customers who placed a later order within 30 days after an earlier order.",
    "schemaRequirements": [
      "orders"
    ],
    "expectedColumns": [
      "customer_id"
    ],
    "initialQuery": "-- Challenge ADVSQL-017: Repeat customers within 30 days\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "WITH x AS (\n  SELECT customer_id, order_id, order_date,\n         LEAD(order_date) OVER (\n           PARTITION BY customer_id ORDER BY order_date, order_id\n         ) AS next_order_date\n  FROM orders\n)\nSELECT DISTINCT customer_id\nFROM x\nWHERE next_order_date > order_date\n  AND next_order_date <= order_date + 30\nORDER BY customer_id;",
    "mysqlSql": "WITH x AS (\n  SELECT customer_id, order_id, order_date,\n         LEAD(order_date) OVER (\n           PARTITION BY customer_id ORDER BY order_date, order_id\n         ) AS next_order_date\n  FROM orders\n)\nSELECT DISTINCT customer_id\nFROM x\nWHERE next_order_date > order_date\n  AND next_order_date <= DATE_ADD(order_date, INTERVAL 30 DAY)\nORDER BY customer_id;",
    "expectedQuery": "WITH x AS (\n  SELECT customer_id, order_id, order_date,\n         LEAD(order_date) OVER (\n           PARTITION BY customer_id ORDER BY order_date, order_id\n         ) AS next_order_date\n  FROM orders\n)\nSELECT DISTINCT customer_id\nFROM x\nWHERE next_order_date > order_date\n  AND next_order_date <= date(order_date, '+30 days')\nORDER BY customer_id;",
    "hints": [
      "Category: Window Functions. Relational logic: window-functions.",
      "Target columns: customer_id"
    ],
    "tags": [
      "window-functions"
    ]
  },
  {
    "id": "ADVSQL-018",
    "number": 18,
    "title": "Order totals recalculated from line items",
    "difficulty": "Hard",
    "category": "CTEs & Aggregation",
    "description": "Recalculate each order's value from quantity, unit price, and percentage discount. Return orders where the calculated total differs from orders.total_amount by more than 0.01.",
    "schemaRequirements": [
      "orders",
      "order_items"
    ],
    "expectedColumns": [
      "*",
      "difference"
    ],
    "initialQuery": "-- Challenge ADVSQL-018: Order totals recalculated from line items\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "WITH calculated AS (\n  SELECT o.order_id, o.total_amount AS stored_total,\n         SUM(oi.quantity * oi.unit_price * (1 - COALESCE(oi.discount_pct, 0) / 100.0)) AS calculated_total\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.order_id\n  GROUP BY o.order_id, o.total_amount\n)\nSELECT *, calculated_total - stored_total AS difference\nFROM calculated\nWHERE ABS(calculated_total - stored_total) > 0.01\nORDER BY order_id;",
    "mysqlSql": "WITH calculated AS (\n  SELECT o.order_id, o.total_amount AS stored_total,\n         SUM(oi.quantity * oi.unit_price * (1 - COALESCE(oi.discount_pct, 0) / 100.0)) AS calculated_total\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.order_id\n  GROUP BY o.order_id, o.total_amount\n)\nSELECT *, calculated_total - stored_total AS difference\nFROM calculated\nWHERE ABS(calculated_total - stored_total) > 0.01\nORDER BY order_id;",
    "expectedQuery": "WITH calculated AS (\n  SELECT o.order_id, o.total_amount AS stored_total,\n         SUM(oi.quantity * oi.unit_price * (1 - COALESCE(oi.discount_pct, 0) / 100.0)) AS calculated_total\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.order_id\n  GROUP BY o.order_id, o.total_amount\n)\nSELECT *, calculated_total - stored_total AS difference\nFROM calculated\nWHERE ABS(calculated_total - stored_total) > 0.01\nORDER BY order_id;",
    "hints": [
      "Category: CTEs & Aggregation. Relational logic: aggregation.",
      "Target columns: *, difference"
    ],
    "tags": [
      "aggregation"
    ]
  },
  {
    "id": "ADVSQL-019",
    "number": 19,
    "title": "Products never ordered",
    "difficulty": "Hard",
    "category": "Joins & Subqueries",
    "description": "Return products that have never appeared in order_items.",
    "schemaRequirements": [
      "products",
      "order_items"
    ],
    "expectedColumns": [
      "product_id",
      "product_name"
    ],
    "initialQuery": "-- Challenge ADVSQL-019: Products never ordered\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "SELECT p.product_id, p.product_name\nFROM products p\nWHERE NOT EXISTS (\n  SELECT 1 FROM order_items oi\n  WHERE oi.product_id = p.product_id\n)\nORDER BY p.product_id;",
    "mysqlSql": "SELECT p.product_id, p.product_name\nFROM products p\nWHERE NOT EXISTS (\n  SELECT 1 FROM order_items oi\n  WHERE oi.product_id = p.product_id\n)\nORDER BY p.product_id;",
    "expectedQuery": "SELECT p.product_id, p.product_name\nFROM products p\nWHERE NOT EXISTS (\n  SELECT 1 FROM order_items oi\n  WHERE oi.product_id = p.product_id\n)\nORDER BY p.product_id;",
    "hints": [
      "Category: Joins & Subqueries. Relational logic: anti-join.",
      "Target columns: product_id, product_name"
    ],
    "tags": [
      "anti-join"
    ]
  },
  {
    "id": "ADVSQL-020",
    "number": 20,
    "title": "Top product in each category by sales",
    "difficulty": "Hard",
    "category": "Window Functions",
    "description": "Calculate net sales per product from order items, then return all products tied for highest sales in their category. Include only completed orders.",
    "schemaRequirements": [
      "products",
      "order_items",
      "orders"
    ],
    "expectedColumns": [
      "product_id",
      "product_name",
      "category",
      "net_sales"
    ],
    "initialQuery": "-- Challenge ADVSQL-020: Top product in each category by sales\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "WITH sales AS (\n  SELECT p.product_id, p.product_name, p.category,\n         SUM(oi.quantity * oi.unit_price *\n             (1 - COALESCE(oi.discount_pct, 0) / 100.0)) AS net_sales\n  FROM products p\n  JOIN order_items oi ON oi.product_id = p.product_id\n  JOIN orders o ON o.order_id = oi.order_id\n  WHERE o.status = 'completed'\n  GROUP BY p.product_id, p.product_name, p.category\n), ranked AS (\n  SELECT sales.*,\n         RANK() OVER (PARTITION BY category ORDER BY net_sales DESC) AS rnk\n  FROM sales\n)\nSELECT product_id, product_name, category, net_sales\nFROM ranked\nWHERE rnk = 1\nORDER BY category, product_id;",
    "mysqlSql": "WITH sales AS (\n  SELECT p.product_id, p.product_name, p.category,\n         SUM(oi.quantity * oi.unit_price *\n             (1 - COALESCE(oi.discount_pct, 0) / 100.0)) AS net_sales\n  FROM products p\n  JOIN order_items oi ON oi.product_id = p.product_id\n  JOIN orders o ON o.order_id = oi.order_id\n  WHERE o.status = 'completed'\n  GROUP BY p.product_id, p.product_name, p.category\n), ranked AS (\n  SELECT sales.*,\n         RANK() OVER (PARTITION BY category ORDER BY net_sales DESC) AS rnk\n  FROM sales\n)\nSELECT product_id, product_name, category, net_sales\nFROM ranked\nWHERE rnk = 1\nORDER BY category, product_id;",
    "expectedQuery": "WITH sales AS (\n  SELECT p.product_id, p.product_name, p.category,\n         SUM(oi.quantity * oi.unit_price *\n             (1 - COALESCE(oi.discount_pct, 0) / 100.0)) AS net_sales\n  FROM products p\n  JOIN order_items oi ON oi.product_id = p.product_id\n  JOIN orders o ON o.order_id = oi.order_id\n  WHERE o.status = 'completed'\n  GROUP BY p.product_id, p.product_name, p.category\n), ranked AS (\n  SELECT sales.*,\n         RANK() OVER (PARTITION BY category ORDER BY net_sales DESC) AS rnk\n  FROM sales\n)\nSELECT product_id, product_name, category, net_sales\nFROM ranked\nWHERE rnk = 1\nORDER BY category, product_id;",
    "hints": [
      "Category: Window Functions. Relational logic: window-functions, aggregation.",
      "Target columns: product_id, product_name, category, net_sales"
    ],
    "tags": [
      "window-functions",
      "aggregation"
    ]
  },
  {
    "id": "ADVSQL-021",
    "number": 21,
    "title": "Category contribution to total sales",
    "difficulty": "Hard",
    "category": "Window Functions",
    "description": "For completed orders, return each category's net sales and percentage contribution to all category sales.",
    "schemaRequirements": [
      "order_items",
      "orders",
      "products"
    ],
    "expectedColumns": [
      "category",
      "net_sales",
      "pct_of_total"
    ],
    "initialQuery": "-- Challenge ADVSQL-021: Category contribution to total sales\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "WITH category_sales AS (\n  SELECT p.category,\n         SUM(oi.quantity * oi.unit_price *\n             (1 - COALESCE(oi.discount_pct, 0) / 100.0)) AS net_sales\n  FROM order_items oi\n  JOIN orders o ON o.order_id = oi.order_id\n  JOIN products p ON p.product_id = oi.product_id\n  WHERE o.status = 'completed'\n  GROUP BY p.category\n)\nSELECT category, net_sales,\n       ROUND(100.0 * net_sales / NULLIF(SUM(net_sales) OVER (), 0), 2) AS pct_of_total\nFROM category_sales\nORDER BY net_sales DESC;",
    "mysqlSql": "WITH category_sales AS (\n  SELECT p.category,\n         SUM(oi.quantity * oi.unit_price *\n             (1 - COALESCE(oi.discount_pct, 0) / 100.0)) AS net_sales\n  FROM order_items oi\n  JOIN orders o ON o.order_id = oi.order_id\n  JOIN products p ON p.product_id = oi.product_id\n  WHERE o.status = 'completed'\n  GROUP BY p.category\n)\nSELECT category, net_sales,\n       ROUND(100.0 * net_sales / NULLIF(SUM(net_sales) OVER (), 0), 2) AS pct_of_total\nFROM category_sales\nORDER BY net_sales DESC;",
    "expectedQuery": "WITH category_sales AS (\n  SELECT p.category,\n         SUM(oi.quantity * oi.unit_price *\n             (1 - COALESCE(oi.discount_pct, 0) / 100.0)) AS net_sales\n  FROM order_items oi\n  JOIN orders o ON o.order_id = oi.order_id\n  JOIN products p ON p.product_id = oi.product_id\n  WHERE o.status = 'completed'\n  GROUP BY p.category\n)\nSELECT category, net_sales,\n       ROUND(100.0 * net_sales / NULLIF(SUM(net_sales) OVER (), 0), 2) AS pct_of_total\nFROM category_sales\nORDER BY net_sales DESC;",
    "hints": [
      "Category: Window Functions. Relational logic: window-functions, aggregation.",
      "Target columns: category, net_sales, pct_of_total"
    ],
    "tags": [
      "window-functions",
      "aggregation"
    ]
  },
  {
    "id": "ADVSQL-022",
    "number": 22,
    "title": "Customers spending above the customer average",
    "difficulty": "Hard",
    "category": "CTEs & Aggregation",
    "description": "Among customers with at least one completed order, return customers whose lifetime completed-order spend exceeds the average spend among such customers.",
    "schemaRequirements": [
      "customers",
      "orders"
    ],
    "expectedColumns": [
      "*"
    ],
    "initialQuery": "-- Challenge ADVSQL-022: Customers spending above the customer average\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "WITH spend AS (\n  SELECT c.customer_id, c.customer_name,\n         SUM(o.total_amount) AS lifetime_spend\n  FROM customers c\n  JOIN orders o ON o.customer_id = c.customer_id\n  WHERE o.status = 'completed'\n  GROUP BY c.customer_id, c.customer_name\n)\nSELECT *\nFROM spend\nWHERE lifetime_spend > (SELECT AVG(lifetime_spend) FROM spend)\nORDER BY lifetime_spend DESC;",
    "mysqlSql": "WITH spend AS (\n  SELECT c.customer_id, c.customer_name,\n         SUM(o.total_amount) AS lifetime_spend\n  FROM customers c\n  JOIN orders o ON o.customer_id = c.customer_id\n  WHERE o.status = 'completed'\n  GROUP BY c.customer_id, c.customer_name\n)\nSELECT *\nFROM spend\nWHERE lifetime_spend > (SELECT AVG(lifetime_spend) FROM spend)\nORDER BY lifetime_spend DESC;",
    "expectedQuery": "WITH spend AS (\n  SELECT c.customer_id, c.customer_name,\n         SUM(o.total_amount) AS lifetime_spend\n  FROM customers c\n  JOIN orders o ON o.customer_id = c.customer_id\n  WHERE o.status = 'completed'\n  GROUP BY c.customer_id, c.customer_name\n)\nSELECT *\nFROM spend\nWHERE lifetime_spend > (SELECT AVG(lifetime_spend) FROM spend)\nORDER BY lifetime_spend DESC;",
    "hints": [
      "Category: CTEs & Aggregation. Relational logic: aggregation.",
      "Target columns: *"
    ],
    "tags": [
      "aggregation"
    ]
  },
  {
    "id": "ADVSQL-023",
    "number": 23,
    "title": "Unpaid or underpaid completed orders",
    "difficulty": "Hard",
    "category": "Joins & Subqueries",
    "description": "Return completed orders whose successful payments total less than the order total. Treat orders without successful payments as zero paid.",
    "schemaRequirements": [
      "orders",
      "payments"
    ],
    "expectedColumns": [
      "order_id",
      "total_amount",
      "paid_amount"
    ],
    "initialQuery": "-- Challenge ADVSQL-023: Unpaid or underpaid completed orders\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "SELECT o.order_id, o.total_amount,\n       COALESCE(SUM(p.amount) FILTER (WHERE p.payment_status = 'successful'), 0) AS paid_amount\nFROM orders o\nLEFT JOIN payments p ON p.order_id = o.order_id\nWHERE o.status = 'completed'\nGROUP BY o.order_id, o.total_amount\nHAVING COALESCE(SUM(p.amount) FILTER (WHERE p.payment_status = 'successful'), 0) < o.total_amount\nORDER BY o.order_id;",
    "mysqlSql": "SELECT o.order_id, o.total_amount,\n       COALESCE(SUM(CASE WHEN p.payment_status = 'successful' THEN p.amount ELSE 0 END), 0) AS paid_amount\nFROM orders o\nLEFT JOIN payments p ON p.order_id = o.order_id\nWHERE o.status = 'completed'\nGROUP BY o.order_id, o.total_amount\nHAVING COALESCE(SUM(CASE WHEN p.payment_status = 'successful' THEN p.amount ELSE 0 END), 0) < o.total_amount\nORDER BY o.order_id;",
    "expectedQuery": "SELECT o.order_id, o.total_amount,\n       COALESCE(SUM(p.amount) FILTER (WHERE p.payment_status = 'successful'), 0) AS paid_amount\nFROM orders o\nLEFT JOIN payments p ON p.order_id = o.order_id\nWHERE o.status = 'completed'\nGROUP BY o.order_id, o.total_amount\nHAVING COALESCE(SUM(p.amount) FILTER (WHERE p.payment_status = 'successful'), 0) < o.total_amount\nORDER BY o.order_id;",
    "hints": [
      "Category: Joins & Subqueries. Relational logic: aggregation.",
      "Target columns: order_id, total_amount, paid_amount"
    ],
    "tags": [
      "aggregation"
    ]
  },
  {
    "id": "ADVSQL-024",
    "number": 24,
    "title": "Customers with orders in every quarter of a year",
    "difficulty": "Hard",
    "category": "Joins & Subqueries",
    "description": "For a given year (use 2025), find customers with at least one order in each of its four calendar quarters.",
    "schemaRequirements": [
      "orders"
    ],
    "expectedColumns": [
      "customer_id"
    ],
    "initialQuery": "-- Challenge ADVSQL-024: Customers with orders in every quarter of a year\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "SELECT customer_id\nFROM orders\nWHERE order_date >= DATE '2025-01-01'\n  AND order_date < DATE '2026-01-01'\nGROUP BY customer_id\nHAVING COUNT(DISTINCT EXTRACT(QUARTER FROM order_date)) = 4\nORDER BY customer_id;",
    "mysqlSql": "SELECT customer_id\nFROM orders\nWHERE order_date >= '2025-01-01'\n  AND order_date < '2026-01-01'\nGROUP BY customer_id\nHAVING COUNT(DISTINCT QUARTER(order_date)) = 4\nORDER BY customer_id;",
    "expectedQuery": "SELECT customer_id\nFROM orders\nWHERE order_date >= '2025-01-01'\n  AND order_date < '2026-01-01'\nGROUP BY customer_id\nHAVING COUNT(DISTINCT EXTRACT(QUARTER FROM order_date)) = 4\nORDER BY customer_id;",
    "hints": [
      "Category: Joins & Subqueries. Relational logic: aggregation.",
      "Target columns: customer_id"
    ],
    "tags": [
      "aggregation"
    ]
  },
  {
    "id": "ADVSQL-025",
    "number": 25,
    "title": "First order and time to second order",
    "difficulty": "Hard",
    "category": "Window Functions",
    "description": "For customers with at least two orders, show their first order date, second order date, and number of days between them.",
    "schemaRequirements": [
      "orders"
    ],
    "expectedColumns": [
      "customer_id",
      "first_order_date",
      "second_order_date",
      "days_to_second_order"
    ],
    "initialQuery": "-- Challenge ADVSQL-025: First order and time to second order\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "WITH ranked AS (\n  SELECT customer_id, order_date,\n         ROW_NUMBER() OVER (\n           PARTITION BY customer_id ORDER BY order_date, order_id\n         ) AS rn\n  FROM orders\n)\nSELECT customer_id,\n       MAX(order_date) FILTER (WHERE rn = 1) AS first_order_date,\n       MAX(order_date) FILTER (WHERE rn = 2) AS second_order_date,\n       MAX(order_date) FILTER (WHERE rn = 2)\n         - MAX(order_date) FILTER (WHERE rn = 1) AS days_to_second_order\nFROM ranked\nWHERE rn <= 2\nGROUP BY customer_id\nHAVING COUNT(*) = 2\nORDER BY customer_id;",
    "mysqlSql": "WITH ranked AS (\n  SELECT customer_id, order_date,\n         ROW_NUMBER() OVER (\n           PARTITION BY customer_id ORDER BY order_date, order_id\n         ) AS rn\n  FROM orders\n)\nSELECT customer_id,\n       MAX(CASE WHEN rn = 1 THEN order_date END) AS first_order_date,\n       MAX(CASE WHEN rn = 2 THEN order_date END) AS second_order_date,\n       DATEDIFF(MAX(CASE WHEN rn = 2 THEN order_date END), MAX(CASE WHEN rn = 1 THEN order_date END)) AS days_to_second_order\nFROM ranked\nWHERE rn <= 2\nGROUP BY customer_id\nHAVING COUNT(*) = 2\nORDER BY customer_id;",
    "expectedQuery": "WITH ranked AS (\n  SELECT customer_id, order_date,\n         ROW_NUMBER() OVER (\n           PARTITION BY customer_id ORDER BY order_date, order_id\n         ) AS rn\n  FROM orders\n)\nSELECT customer_id,\n       MAX(order_date) FILTER (WHERE rn = 1) AS first_order_date,\n       MAX(order_date) FILTER (WHERE rn = 2) AS second_order_date,\n       MAX(order_date) FILTER (WHERE rn = 2)\n         - MAX(order_date) FILTER (WHERE rn = 1) AS days_to_second_order\nFROM ranked\nWHERE rn <= 2\nGROUP BY customer_id\nHAVING COUNT(*) = 2\nORDER BY customer_id;",
    "hints": [
      "Category: Window Functions. Relational logic: window-functions, aggregation.",
      "Target columns: customer_id, first_order_date, second_order_date, days_to_second_order"
    ],
    "tags": [
      "window-functions",
      "aggregation"
    ]
  },
  {
    "id": "ADVSQL-026",
    "number": 26,
    "title": "Customer retention by signup cohort",
    "difficulty": "Hard",
    "category": "CTEs & Aggregation",
    "description": "For each signup month, calculate the number of customers who signed up in that month and the number who made a completed purchase in the same month.",
    "schemaRequirements": [
      "customers",
      "orders"
    ],
    "expectedColumns": [
      "cohort_month",
      "signed_up_customers",
      "same_month_buyers"
    ],
    "initialQuery": "-- Challenge ADVSQL-026: Customer retention by signup cohort\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "WITH cohort AS (\n  SELECT customer_id, DATE_TRUNC('month', signup_date)::date AS cohort_month\n  FROM customers\n), buyers AS (\n  SELECT DISTINCT customer_id, DATE_TRUNC('month', order_date)::date AS order_month\n  FROM orders\n  WHERE status = 'completed'\n)\nSELECT c.cohort_month,\n       COUNT(DISTINCT c.customer_id) AS signed_up_customers,\n       COUNT(DISTINCT b.customer_id) AS same_month_buyers\nFROM cohort c\nLEFT JOIN buyers b\n  ON b.customer_id = c.customer_id\n AND b.order_month = c.cohort_month\nGROUP BY c.cohort_month\nORDER BY c.cohort_month;",
    "mysqlSql": "WITH cohort AS (\n  SELECT customer_id, DATE_FORMAT(signup_date, '%Y-%m-01') AS cohort_month\n  FROM customers\n), buyers AS (\n  SELECT DISTINCT customer_id, DATE_FORMAT(order_date, '%Y-%m-01') AS order_month\n  FROM orders\n  WHERE status = 'completed'\n)\nSELECT c.cohort_month,\n       COUNT(DISTINCT c.customer_id) AS signed_up_customers,\n       COUNT(DISTINCT b.customer_id) AS same_month_buyers\nFROM cohort c\nLEFT JOIN buyers b\n  ON b.customer_id = c.customer_id\n AND b.order_month = c.cohort_month\nGROUP BY c.cohort_month\nORDER BY c.cohort_month;",
    "expectedQuery": "WITH cohort AS (\n  SELECT customer_id, DATE_TRUNC('month', signup_date) AS cohort_month\n  FROM customers\n), buyers AS (\n  SELECT DISTINCT customer_id, DATE_TRUNC('month', order_date) AS order_month\n  FROM orders\n  WHERE status = 'completed'\n)\nSELECT c.cohort_month,\n       COUNT(DISTINCT c.customer_id) AS signed_up_customers,\n       COUNT(DISTINCT b.customer_id) AS same_month_buyers\nFROM cohort c\nLEFT JOIN buyers b\n  ON b.customer_id = c.customer_id\n AND b.order_month = c.cohort_month\nGROUP BY c.cohort_month\nORDER BY c.cohort_month;",
    "hints": [
      "Category: CTEs & Aggregation. Relational logic: aggregation.",
      "Target columns: cohort_month, signed_up_customers, same_month_buyers"
    ],
    "tags": [
      "aggregation"
    ]
  },
  {
    "id": "ADVSQL-027",
    "number": 27,
    "title": "Most recent order status per customer",
    "difficulty": "Hard",
    "category": "Window Functions",
    "description": "Return the most recent order for every customer, including customers with no orders.",
    "schemaRequirements": [
      "orders",
      "customers"
    ],
    "expectedColumns": [
      "customer_id",
      "customer_name",
      "order_id",
      "order_date",
      "status"
    ],
    "initialQuery": "-- Challenge ADVSQL-027: Most recent order status per customer\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "WITH ranked AS (\n  SELECT o.*,\n         ROW_NUMBER() OVER (\n           PARTITION BY customer_id ORDER BY order_date DESC, order_id DESC\n         ) AS rn\n  FROM orders o\n)\nSELECT c.customer_id, c.customer_name,\n       r.order_id, r.order_date, r.status\nFROM customers c\nLEFT JOIN ranked r ON r.customer_id = c.customer_id AND r.rn = 1\nORDER BY c.customer_id;",
    "mysqlSql": "WITH ranked AS (\n  SELECT o.*,\n         ROW_NUMBER() OVER (\n           PARTITION BY customer_id ORDER BY order_date DESC, order_id DESC\n         ) AS rn\n  FROM orders o\n)\nSELECT c.customer_id, c.customer_name,\n       r.order_id, r.order_date, r.status\nFROM customers c\nLEFT JOIN ranked r ON r.customer_id = c.customer_id AND r.rn = 1\nORDER BY c.customer_id;",
    "expectedQuery": "WITH ranked AS (\n  SELECT o.*,\n         ROW_NUMBER() OVER (\n           PARTITION BY customer_id ORDER BY order_date DESC, order_id DESC\n         ) AS rn\n  FROM orders o\n)\nSELECT c.customer_id, c.customer_name,\n       r.order_id, r.order_date, r.status\nFROM customers c\nLEFT JOIN ranked r ON r.customer_id = c.customer_id AND r.rn = 1\nORDER BY c.customer_id;",
    "hints": [
      "Category: Window Functions. Relational logic: window-functions.",
      "Target columns: customer_id, customer_name, order_id, order_date, status"
    ],
    "tags": [
      "window-functions"
    ]
  },
  {
    "id": "ADVSQL-028",
    "number": 28,
    "title": "Median salary by department",
    "difficulty": "Hard",
    "category": "Joins & Subqueries",
    "description": "Return the median salary in each department. Include departments with no employees as NULL median.",
    "schemaRequirements": [
      "departments",
      "employees"
    ],
    "expectedColumns": [
      "department_id",
      "department_name",
      "median_salary"
    ],
    "initialQuery": "-- Challenge ADVSQL-028: Median salary by department\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "SELECT d.department_id, d.department_name,\n       percentile_cont(0.5) WITHIN GROUP (ORDER BY e.salary) AS median_salary\nFROM departments d\nLEFT JOIN employees e ON e.department_id = d.department_id\nGROUP BY d.department_id, d.department_name\nORDER BY d.department_id;",
    "mysqlSql": "SELECT d.department_id, d.department_name,\n       AVG(e.salary) AS median_salary\nFROM departments d\nLEFT JOIN employees e ON e.department_id = d.department_id\nGROUP BY d.department_id, d.department_name\nORDER BY d.department_id;",
    "expectedQuery": "SELECT d.department_id, d.department_name,\n       AVG(e.salary) AS median_salary\nFROM departments d\nLEFT JOIN employees e ON e.department_id = d.department_id\nGROUP BY d.department_id, d.department_name\nORDER BY d.department_id;",
    "hints": [
      "Category: Joins & Subqueries. Relational logic: aggregation.",
      "Target columns: department_id, department_name, median_salary"
    ],
    "tags": [
      "aggregation"
    ]
  },
  {
    "id": "ADVSQL-029",
    "number": 29,
    "title": "Salary compression within departments",
    "difficulty": "Hard",
    "category": "Joins & Subqueries",
    "description": "For each department with at least two employees, calculate the difference between highest and lowest salary and the ratio of highest to lowest salary.",
    "schemaRequirements": [
      "departments",
      "employees"
    ],
    "expectedColumns": [
      "department_id",
      "department_name",
      "salary_spread",
      "max_min_ratio"
    ],
    "initialQuery": "-- Challenge ADVSQL-029: Salary compression within departments\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "SELECT d.department_id, d.department_name,\n       MAX(e.salary) - MIN(e.salary) AS salary_spread,\n       MAX(e.salary) / NULLIF(MIN(e.salary), 0) AS max_min_ratio\nFROM departments d\nJOIN employees e ON e.department_id = d.department_id\nGROUP BY d.department_id, d.department_name\nHAVING COUNT(*) >= 2\nORDER BY salary_spread DESC;",
    "mysqlSql": "SELECT d.department_id, d.department_name,\n       MAX(e.salary) - MIN(e.salary) AS salary_spread,\n       MAX(e.salary) / NULLIF(MIN(e.salary), 0) AS max_min_ratio\nFROM departments d\nJOIN employees e ON e.department_id = d.department_id\nGROUP BY d.department_id, d.department_name\nHAVING COUNT(*) >= 2\nORDER BY salary_spread DESC;",
    "expectedQuery": "SELECT d.department_id, d.department_name,\n       MAX(e.salary) - MIN(e.salary) AS salary_spread,\n       MAX(e.salary) / NULLIF(MIN(e.salary), 0) AS max_min_ratio\nFROM departments d\nJOIN employees e ON e.department_id = d.department_id\nGROUP BY d.department_id, d.department_name\nHAVING COUNT(*) >= 2\nORDER BY salary_spread DESC;",
    "hints": [
      "Category: Joins & Subqueries. Relational logic: aggregation.",
      "Target columns: department_id, department_name, salary_spread, max_min_ratio"
    ],
    "tags": [
      "aggregation"
    ]
  },
  {
    "id": "ADVSQL-030",
    "number": 30,
    "title": "Employees hired before their manager",
    "difficulty": "Hard",
    "category": "Joins & Subqueries",
    "description": "Find employees whose hire date is earlier than their manager's hire date.",
    "schemaRequirements": [
      "employees"
    ],
    "expectedColumns": [
      "employee_id",
      "employee_name",
      "hire_date",
      "manager_name",
      "manager_hire_date"
    ],
    "initialQuery": "-- Challenge ADVSQL-030: Employees hired before their manager\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "SELECT e.employee_id, e.employee_name, e.hire_date,\n       m.employee_name AS manager_name, m.hire_date AS manager_hire_date\nFROM employees e\nJOIN employees m ON m.employee_id = e.manager_id\nWHERE e.hire_date < m.hire_date\nORDER BY e.employee_id;",
    "mysqlSql": "SELECT e.employee_id, e.employee_name, e.hire_date,\n       m.employee_name AS manager_name, m.hire_date AS manager_hire_date\nFROM employees e\nJOIN employees m ON m.employee_id = e.manager_id\nWHERE e.hire_date < m.hire_date\nORDER BY e.employee_id;",
    "expectedQuery": "SELECT e.employee_id, e.employee_name, e.hire_date,\n       m.employee_name AS manager_name, m.hire_date AS manager_hire_date\nFROM employees e\nJOIN employees m ON m.employee_id = e.manager_id\nWHERE e.hire_date < m.hire_date\nORDER BY e.employee_id;",
    "hints": [
      "Category: Joins & Subqueries. Relational logic: aggregations & joins.",
      "Target columns: employee_id, employee_name, hire_date, manager_name, manager_hire_date"
    ],
    "tags": []
  },
  {
    "id": "ADVSQL-031",
    "number": 31,
    "title": "Latest salary-history record per employee",
    "difficulty": "Hard",
    "category": "Window Functions",
    "description": "Return the latest salary-history row for each employee; break same-date ties with highest history_id.",
    "schemaRequirements": [
      "salary_history"
    ],
    "expectedColumns": [
      "employee_id",
      "effective_date",
      "salary"
    ],
    "initialQuery": "-- Challenge ADVSQL-031: Latest salary-history record per employee\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "WITH ranked AS (\n  SELECT sh.*,\n         ROW_NUMBER() OVER (\n           PARTITION BY employee_id\n           ORDER BY effective_date DESC, history_id DESC\n         ) AS rn\n  FROM salary_history sh\n)\nSELECT employee_id, effective_date, salary\nFROM ranked\nWHERE rn = 1\nORDER BY employee_id;",
    "mysqlSql": "WITH ranked AS (\n  SELECT sh.*,\n         ROW_NUMBER() OVER (\n           PARTITION BY employee_id\n           ORDER BY effective_date DESC, history_id DESC\n         ) AS rn\n  FROM salary_history sh\n)\nSELECT employee_id, effective_date, salary\nFROM ranked\nWHERE rn = 1\nORDER BY employee_id;",
    "expectedQuery": "WITH ranked AS (\n  SELECT sh.*,\n         ROW_NUMBER() OVER (\n           PARTITION BY employee_id\n           ORDER BY effective_date DESC, history_id DESC\n         ) AS rn\n  FROM salary_history sh\n)\nSELECT employee_id, effective_date, salary\nFROM ranked\nWHERE rn = 1\nORDER BY employee_id;",
    "hints": [
      "Category: Window Functions. Relational logic: window-functions.",
      "Target columns: employee_id, effective_date, salary"
    ],
    "tags": [
      "window-functions"
    ]
  },
  {
    "id": "ADVSQL-032",
    "number": 32,
    "title": "Employees whose salary never decreased",
    "difficulty": "Hard",
    "category": "Window Functions",
    "description": "Using salary_history, return employees whose salary never decreased from one effective record to the next. Require at least two history rows.",
    "schemaRequirements": [
      "salary_history"
    ],
    "expectedColumns": [
      "employee_id"
    ],
    "initialQuery": "-- Challenge ADVSQL-032: Employees whose salary never decreased\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "WITH x AS (\n  SELECT employee_id, effective_date, salary,\n         LAG(salary) OVER (\n           PARTITION BY employee_id ORDER BY effective_date, history_id\n         ) AS prior_salary,\n         COUNT(*) OVER (PARTITION BY employee_id) AS row_count\n  FROM salary_history\n)\nSELECT employee_id\nFROM x\nGROUP BY employee_id\nHAVING MAX(row_count) >= 2\n   AND BOOL_AND(prior_salary IS NULL OR salary >= prior_salary)\nORDER BY employee_id;",
    "mysqlSql": "WITH x AS (\n  SELECT employee_id, effective_date, salary,\n         LAG(salary) OVER (\n           PARTITION BY employee_id ORDER BY effective_date, history_id\n         ) AS prior_salary,\n         COUNT(*) OVER (PARTITION BY employee_id) AS row_count\n  FROM salary_history\n)\nSELECT employee_id\nFROM x\nGROUP BY employee_id\nHAVING MAX(row_count) >= 2\n   AND BOOL_AND(prior_salary IS NULL OR salary >= prior_salary)\nORDER BY employee_id;",
    "expectedQuery": "WITH x AS (\n  SELECT employee_id, effective_date, salary,\n         LAG(salary) OVER (\n           PARTITION BY employee_id ORDER BY effective_date, history_id\n         ) AS prior_salary,\n         COUNT(*) OVER (PARTITION BY employee_id) AS row_count\n  FROM salary_history\n)\nSELECT employee_id\nFROM x\nGROUP BY employee_id\nHAVING MAX(row_count) >= 2\n   AND BOOL_AND(prior_salary IS NULL OR salary >= prior_salary)\nORDER BY employee_id;",
    "hints": [
      "Category: Window Functions. Relational logic: window-functions, aggregation.",
      "Target columns: employee_id"
    ],
    "tags": [
      "window-functions",
      "aggregation"
    ]
  },
  {
    "id": "ADVSQL-033",
    "number": 33,
    "title": "Consecutive login-day streaks",
    "difficulty": "Hard",
    "category": "Window Functions",
    "description": "Return each customer's longest streak of consecutive calendar days with at least one login. Output customer_id and longest_streak_days.",
    "schemaRequirements": [
      "logins"
    ],
    "expectedColumns": [
      "customer_id",
      "longest_streak_days"
    ],
    "initialQuery": "-- Challenge ADVSQL-033: Consecutive login-day streaks\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "WITH days AS (\n  SELECT DISTINCT customer_id, login_date::date AS login_day\n  FROM logins\n), islands AS (\n  SELECT customer_id, login_day,\n         login_day - (ROW_NUMBER() OVER (\n           PARTITION BY customer_id ORDER BY login_day\n         ))::int AS grp\n  FROM days\n), streaks AS (\n  SELECT customer_id, grp, COUNT(*) AS streak_days\n  FROM islands\n  GROUP BY customer_id, grp\n)\nSELECT customer_id, MAX(streak_days) AS longest_streak_days\nFROM streaks\nGROUP BY customer_id\nORDER BY customer_id;",
    "mysqlSql": "WITH days AS (\n  SELECT DISTINCT customer_id, login_date AS login_day\n  FROM logins\n), islands AS (\n  SELECT customer_id, login_day,\n         login_day - (ROW_NUMBER() OVER (\n           PARTITION BY customer_id ORDER BY login_day\n         )) AS grp\n  FROM days\n), streaks AS (\n  SELECT customer_id, grp, COUNT(*) AS streak_days\n  FROM islands\n  GROUP BY customer_id, grp\n)\nSELECT customer_id, MAX(streak_days) AS longest_streak_days\nFROM streaks\nGROUP BY customer_id\nORDER BY customer_id;",
    "expectedQuery": "WITH days AS (\n  SELECT DISTINCT customer_id, login_date AS login_day\n  FROM logins\n), islands AS (\n  SELECT customer_id, login_day,\n         login_day - (ROW_NUMBER() OVER (\n           PARTITION BY customer_id ORDER BY login_day\n         )) AS grp\n  FROM days\n), streaks AS (\n  SELECT customer_id, grp, COUNT(*) AS streak_days\n  FROM islands\n  GROUP BY customer_id, grp\n)\nSELECT customer_id, MAX(streak_days) AS longest_streak_days\nFROM streaks\nGROUP BY customer_id\nORDER BY customer_id;",
    "hints": [
      "Category: Window Functions. Relational logic: window-functions, aggregation.",
      "Target columns: customer_id, longest_streak_days"
    ],
    "tags": [
      "window-functions",
      "aggregation"
    ]
  },
  {
    "id": "ADVSQL-034",
    "number": 34,
    "title": "Find gaps in daily logins",
    "difficulty": "Hard",
    "category": "Window Functions",
    "description": "For each customer, list pairs of login days where there is at least one missing calendar day between consecutive login dates.",
    "schemaRequirements": [
      "logins"
    ],
    "expectedColumns": [
      "customer_id",
      "login_day",
      "next_login_day",
      "missing_days"
    ],
    "initialQuery": "-- Challenge ADVSQL-034: Find gaps in daily logins\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "WITH days AS (\n  SELECT DISTINCT customer_id, login_date::date AS login_day\n  FROM logins\n), x AS (\n  SELECT customer_id, login_day,\n         LEAD(login_day) OVER (\n           PARTITION BY customer_id ORDER BY login_day\n         ) AS next_login_day\n  FROM days\n)\nSELECT customer_id, login_day, next_login_day,\n       next_login_day - login_day - 1 AS missing_days\nFROM x\nWHERE next_login_day > login_day + 1\nORDER BY customer_id, login_day;",
    "mysqlSql": "WITH days AS (\n  SELECT DISTINCT customer_id, login_date AS login_day\n  FROM logins\n), x AS (\n  SELECT customer_id, login_day,\n         LEAD(login_day) OVER (\n           PARTITION BY customer_id ORDER BY login_day\n         ) AS next_login_day\n  FROM days\n)\nSELECT customer_id, login_day, next_login_day,\n       next_login_day - login_day - 1 AS missing_days\nFROM x\nWHERE next_login_day > login_day + 1\nORDER BY customer_id, login_day;",
    "expectedQuery": "WITH days AS (\n  SELECT DISTINCT customer_id, login_date AS login_day\n  FROM logins\n), x AS (\n  SELECT customer_id, login_day,\n         LEAD(login_day) OVER (\n           PARTITION BY customer_id ORDER BY login_day\n         ) AS next_login_day\n  FROM days\n)\nSELECT customer_id, login_day, next_login_day,\n       next_login_day - login_day - 1 AS missing_days\nFROM x\nWHERE next_login_day > login_day + 1\nORDER BY customer_id, login_day;",
    "hints": [
      "Category: Window Functions. Relational logic: window-functions.",
      "Target columns: customer_id, login_day, next_login_day, missing_days"
    ],
    "tags": [
      "window-functions"
    ]
  },
  {
    "id": "ADVSQL-035",
    "number": 35,
    "title": "Longest session per user",
    "difficulty": "Hard",
    "category": "Window Functions",
    "description": "Treat a session as grouped by session_id. Return all sessions tied for the maximum duration per user, measured in seconds between first and last event.",
    "schemaRequirements": [
      "events"
    ],
    "expectedColumns": [
      "user_id",
      "session_id",
      "duration_seconds"
    ],
    "initialQuery": "-- Challenge ADVSQL-035: Longest session per user\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "WITH sessions AS (\n  SELECT user_id, session_id,\n         EXTRACT(EPOCH FROM (MAX(event_time) - MIN(event_time))) AS duration_seconds\n  FROM events\n  GROUP BY user_id, session_id\n), ranked AS (\n  SELECT sessions.*,\n         RANK() OVER (PARTITION BY user_id ORDER BY duration_seconds DESC) AS rnk\n  FROM sessions\n)\nSELECT user_id, session_id, duration_seconds\nFROM ranked\nWHERE rnk = 1\nORDER BY user_id, session_id;",
    "mysqlSql": "WITH sessions AS (\n  SELECT user_id, session_id,\n         TIMESTAMPDIFF(SECOND, MIN(event_time), MAX(event_time)) AS duration_seconds\n  FROM events\n  GROUP BY user_id, session_id\n), ranked AS (\n  SELECT sessions.*,\n         RANK() OVER (PARTITION BY user_id ORDER BY duration_seconds DESC) AS rnk\n  FROM sessions\n)\nSELECT user_id, session_id, duration_seconds\nFROM ranked\nWHERE rnk = 1\nORDER BY user_id, session_id;",
    "expectedQuery": "WITH sessions AS (\n  SELECT user_id, session_id,\n         (strftime('%s', MAX(event_time)) - strftime('%s', MIN(event_time))) AS duration_seconds\n  FROM events\n  GROUP BY user_id, session_id\n), ranked AS (\n  SELECT sessions.*,\n         RANK() OVER (PARTITION BY user_id ORDER BY duration_seconds DESC) AS rnk\n  FROM sessions\n)\nSELECT user_id, session_id, duration_seconds\nFROM ranked\nWHERE rnk = 1\nORDER BY user_id, session_id;",
    "hints": [
      "Category: Window Functions. Relational logic: window-functions, aggregation.",
      "Target columns: user_id, session_id, duration_seconds"
    ],
    "tags": [
      "window-functions",
      "aggregation"
    ]
  },
  {
    "id": "ADVSQL-036",
    "number": 36,
    "title": "Sessionization with a 30-minute inactivity threshold",
    "difficulty": "Hard",
    "category": "Window Functions",
    "description": "Create sessions per user by starting a new session whenever the gap from the prior event exceeds 30 minutes. Return each user's session number, start time, and end time.",
    "schemaRequirements": [
      "events"
    ],
    "expectedColumns": [
      "user_id",
      "session_number",
      "session_start",
      "session_end",
      "event_count"
    ],
    "initialQuery": "-- Challenge ADVSQL-036: Sessionization with a 30-minute inactivity threshold\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "WITH ordered AS (\n  SELECT e.*,\n         LAG(event_time) OVER (\n           PARTITION BY user_id ORDER BY event_time, event_id\n         ) AS prev_time\n  FROM events e\n), marked AS (\n  SELECT *,\n         CASE WHEN prev_time IS NULL\n                   OR event_time > prev_time + INTERVAL '30 minutes'\n              THEN 1 ELSE 0 END AS new_session\n  FROM ordered\n), numbered AS (\n  SELECT *,\n         SUM(new_session) OVER (\n           PARTITION BY user_id ORDER BY event_time, event_id\n           ROWS UNBOUNDED PRECEDING\n         ) AS session_number\n  FROM marked\n)\nSELECT user_id, session_number,\n       MIN(event_time) AS session_start,\n       MAX(event_time) AS session_end,\n       COUNT(*) AS event_count\nFROM numbered\nGROUP BY user_id, session_number\nORDER BY user_id, session_number;",
    "mysqlSql": "WITH ordered AS (\n  SELECT e.*,\n         LAG(event_time) OVER (\n           PARTITION BY user_id ORDER BY event_time, event_id\n         ) AS prev_time\n  FROM events e\n), marked AS (\n  SELECT *,\n         CASE WHEN prev_time IS NULL\n                   OR event_time > prev_time + INTERVAL 30 MINUTE\n              THEN 1 ELSE 0 END AS new_session\n  FROM ordered\n), numbered AS (\n  SELECT *,\n         SUM(new_session) OVER (\n           PARTITION BY user_id ORDER BY event_time, event_id\n           ROWS UNBOUNDED PRECEDING\n         ) AS session_number\n  FROM marked\n)\nSELECT user_id, session_number,\n       MIN(event_time) AS session_start,\n       MAX(event_time) AS session_end,\n       COUNT(*) AS event_count\nFROM numbered\nGROUP BY user_id, session_number\nORDER BY user_id, session_number;",
    "expectedQuery": "WITH ordered AS (\n  SELECT e.*,\n         LAG(event_time) OVER (\n           PARTITION BY user_id ORDER BY event_time, event_id\n         ) AS prev_time\n  FROM events e\n), marked AS (\n  SELECT *,\n         CASE WHEN prev_time IS NULL\n                   OR strftime('%s', event_time) - strftime('%s', prev_time) > 1800\n              THEN 1 ELSE 0 END AS new_session\n  FROM ordered\n), numbered AS (\n  SELECT *,\n         SUM(new_session) OVER (\n           PARTITION BY user_id ORDER BY event_time, event_id\n           ROWS UNBOUNDED PRECEDING\n         ) AS session_number\n  FROM marked\n)\nSELECT user_id, session_number,\n       MIN(event_time) AS session_start,\n       MAX(event_time) AS session_end,\n       COUNT(*) AS event_count\nFROM numbered\nGROUP BY user_id, session_number\nORDER BY user_id, session_number;",
    "hints": [
      "Category: Window Functions. Relational logic: window-functions, aggregation.",
      "Target columns: user_id, session_number, session_start, session_end, event_count"
    ],
    "tags": [
      "window-functions",
      "aggregation"
    ]
  },
  {
    "id": "ADVSQL-037",
    "number": 37,
    "title": "Event conversion funnel",
    "difficulty": "Hard",
    "category": "Joins & Subqueries",
    "description": "For each user, count users who performed event_type 'view', then 'cart', then 'purchase' at least once. These are independent stage counts, not necessarily ordered.",
    "schemaRequirements": [
      "events"
    ],
    "expectedColumns": [
      "users_viewed",
      "users_added_to_cart",
      "users_purchased"
    ],
    "initialQuery": "-- Challenge ADVSQL-037: Event conversion funnel\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "SELECT\n  COUNT(DISTINCT user_id) FILTER (WHERE event_type = 'view') AS users_viewed,\n  COUNT(DISTINCT user_id) FILTER (WHERE event_type = 'cart') AS users_added_to_cart,\n  COUNT(DISTINCT user_id) FILTER (WHERE event_type = 'purchase') AS users_purchased\nFROM events;",
    "mysqlSql": "SELECT\n  COUNT(DISTINCT CASE WHEN event_type = 'view' THEN user_id END) AS users_viewed,\n  COUNT(DISTINCT CASE WHEN event_type = 'cart' THEN user_id END) AS users_added_to_cart,\n  COUNT(DISTINCT CASE WHEN event_type = 'purchase' THEN user_id END) AS users_purchased\nFROM events;",
    "expectedQuery": "SELECT\n  COUNT(DISTINCT user_id) FILTER (WHERE event_type = 'view') AS users_viewed,\n  COUNT(DISTINCT user_id) FILTER (WHERE event_type = 'cart') AS users_added_to_cart,\n  COUNT(DISTINCT user_id) FILTER (WHERE event_type = 'purchase') AS users_purchased\nFROM events;",
    "hints": [
      "Category: Joins & Subqueries. Relational logic: aggregation.",
      "Target columns: users_viewed, users_added_to_cart, users_purchased"
    ],
    "tags": [
      "aggregation"
    ]
  },
  {
    "id": "ADVSQL-038",
    "number": 38,
    "title": "Ordered conversion funnel",
    "difficulty": "Hard",
    "category": "CTEs & Aggregation",
    "description": "Count users who performed view, then cart, then purchase in that chronological order. Events must be strictly later at each stage.",
    "schemaRequirements": [
      "events"
    ],
    "expectedColumns": [
      "viewed_users",
      "viewed_then_cart_users",
      "(SELECT COUNT(*) FROM next_purchase) AS viewed_cart_purchase_users;"
    ],
    "initialQuery": "-- Challenge ADVSQL-038: Ordered conversion funnel\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "WITH first_view AS (\n  SELECT user_id, MIN(event_time) AS view_time\n  FROM events WHERE event_type = 'view'\n  GROUP BY user_id\n), next_cart AS (\n  SELECT v.user_id, v.view_time, MIN(e.event_time) AS cart_time\n  FROM first_view v\n  JOIN events e ON e.user_id = v.user_id\n              AND e.event_type = 'cart'\n              AND e.event_time > v.view_time\n  GROUP BY v.user_id, v.view_time\n), next_purchase AS (\n  SELECT c.user_id\n  FROM next_cart c\n  JOIN events e ON e.user_id = c.user_id\n              AND e.event_type = 'purchase'\n              AND e.event_time > c.cart_time\n  GROUP BY c.user_id\n)\nSELECT\n  (SELECT COUNT(*) FROM first_view) AS viewed_users,\n  (SELECT COUNT(*) FROM next_cart) AS viewed_then_cart_users,\n  (SELECT COUNT(*) FROM next_purchase) AS viewed_cart_purchase_users;",
    "mysqlSql": "WITH first_view AS (\n  SELECT user_id, MIN(event_time) AS view_time\n  FROM events WHERE event_type = 'view'\n  GROUP BY user_id\n), next_cart AS (\n  SELECT v.user_id, v.view_time, MIN(e.event_time) AS cart_time\n  FROM first_view v\n  JOIN events e ON e.user_id = v.user_id\n              AND e.event_type = 'cart'\n              AND e.event_time > v.view_time\n  GROUP BY v.user_id, v.view_time\n), next_purchase AS (\n  SELECT c.user_id\n  FROM next_cart c\n  JOIN events e ON e.user_id = c.user_id\n              AND e.event_type = 'purchase'\n              AND e.event_time > c.cart_time\n  GROUP BY c.user_id\n)\nSELECT\n  (SELECT COUNT(*) FROM first_view) AS viewed_users,\n  (SELECT COUNT(*) FROM next_cart) AS viewed_then_cart_users,\n  (SELECT COUNT(*) FROM next_purchase) AS viewed_cart_purchase_users;",
    "expectedQuery": "WITH first_view AS (\n  SELECT user_id, MIN(event_time) AS view_time\n  FROM events WHERE event_type = 'view'\n  GROUP BY user_id\n), next_cart AS (\n  SELECT v.user_id, v.view_time, MIN(e.event_time) AS cart_time\n  FROM first_view v\n  JOIN events e ON e.user_id = v.user_id\n              AND e.event_type = 'cart'\n              AND e.event_time > v.view_time\n  GROUP BY v.user_id, v.view_time\n), next_purchase AS (\n  SELECT c.user_id\n  FROM next_cart c\n  JOIN events e ON e.user_id = c.user_id\n              AND e.event_type = 'purchase'\n              AND e.event_time > c.cart_time\n  GROUP BY c.user_id\n)\nSELECT\n  (SELECT COUNT(*) FROM first_view) AS viewed_users,\n  (SELECT COUNT(*) FROM next_cart) AS viewed_then_cart_users,\n  (SELECT COUNT(*) FROM next_purchase) AS viewed_cart_purchase_users;",
    "hints": [
      "Category: CTEs & Aggregation. Relational logic: aggregation.",
      "Target columns: viewed_users, viewed_then_cart_users, (SELECT COUNT(*) FROM next_purchase) AS viewed_cart_purchase_users;"
    ],
    "tags": [
      "aggregation"
    ]
  },
  {
    "id": "ADVSQL-039",
    "number": 39,
    "title": "Products priced above their category average",
    "difficulty": "Hard",
    "category": "Window Functions",
    "description": "Return active products whose list price exceeds the average list price of active products in their category.",
    "schemaRequirements": [
      "products"
    ],
    "expectedColumns": [
      "product_id",
      "product_name",
      "category",
      "list_price"
    ],
    "initialQuery": "-- Challenge ADVSQL-039: Products priced above their category average\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "SELECT product_id, product_name, category, list_price\nFROM (\n  SELECT p.*,\n         AVG(list_price) OVER (PARTITION BY category) AS category_avg\n  FROM products p\n  WHERE active = TRUE\n) x\nWHERE list_price > category_avg\nORDER BY category, list_price DESC;",
    "mysqlSql": "SELECT product_id, product_name, category, list_price\nFROM (\n  SELECT p.*,\n         AVG(list_price) OVER (PARTITION BY category) AS category_avg\n  FROM products p\n  WHERE active = TRUE\n) x\nWHERE list_price > category_avg\nORDER BY category, list_price DESC;",
    "expectedQuery": "SELECT product_id, product_name, category, list_price\nFROM (\n  SELECT p.*,\n         AVG(list_price) OVER (PARTITION BY category) AS category_avg\n  FROM products p\n  WHERE active = TRUE\n) x\nWHERE list_price > category_avg\nORDER BY category, list_price DESC;",
    "hints": [
      "Category: Window Functions. Relational logic: window-functions, aggregation.",
      "Target columns: product_id, product_name, category, list_price"
    ],
    "tags": [
      "window-functions",
      "aggregation"
    ]
  },
  {
    "id": "ADVSQL-040",
    "number": 40,
    "title": "Price percentile per product",
    "difficulty": "Hard",
    "category": "Window Functions",
    "description": "For each active product, calculate its percent rank by list_price within its category.",
    "schemaRequirements": [
      "products"
    ],
    "expectedColumns": [
      "product_id",
      "product_name",
      "category",
      "list_price",
      "price_percent_rank"
    ],
    "initialQuery": "-- Challenge ADVSQL-040: Price percentile per product\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "SELECT product_id, product_name, category, list_price,\n       PERCENT_RANK() OVER (\n         PARTITION BY category ORDER BY list_price\n       ) AS price_percent_rank\nFROM products\nWHERE active = TRUE\nORDER BY category, list_price;",
    "mysqlSql": "SELECT product_id, product_name, category, list_price,\n       PERCENT_RANK() OVER (\n         PARTITION BY category ORDER BY list_price\n       ) AS price_percent_rank\nFROM products\nWHERE active = TRUE\nORDER BY category, list_price;",
    "expectedQuery": "SELECT product_id, product_name, category, list_price,\n       PERCENT_RANK() OVER (\n         PARTITION BY category ORDER BY list_price\n       ) AS price_percent_rank\nFROM products\nWHERE active = TRUE\nORDER BY category, list_price;",
    "hints": [
      "Category: Window Functions. Relational logic: window-functions.",
      "Target columns: product_id, product_name, category, list_price, price_percent_rank"
    ],
    "tags": [
      "window-functions"
    ]
  },
  {
    "id": "ADVSQL-041",
    "number": 41,
    "title": "Revenue share by customer within country",
    "difficulty": "Hard",
    "category": "Window Functions",
    "description": "For each customer with completed-order revenue, show lifetime revenue and the percentage of their country's customer revenue.",
    "schemaRequirements": [
      "customers",
      "orders"
    ],
    "expectedColumns": [
      "*",
      "country_revenue_pct"
    ],
    "initialQuery": "-- Challenge ADVSQL-041: Revenue share by customer within country\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "WITH customer_revenue AS (\n  SELECT c.customer_id, c.customer_name, c.country,\n         SUM(o.total_amount) AS revenue\n  FROM customers c\n  JOIN orders o ON o.customer_id = c.customer_id\n  WHERE o.status = 'completed'\n  GROUP BY c.customer_id, c.customer_name, c.country\n)\nSELECT *,\n       ROUND(100.0 * revenue /\n         NULLIF(SUM(revenue) OVER (PARTITION BY country), 0), 2) AS country_revenue_pct\nFROM customer_revenue\nORDER BY country, revenue DESC;",
    "mysqlSql": "WITH customer_revenue AS (\n  SELECT c.customer_id, c.customer_name, c.country,\n         SUM(o.total_amount) AS revenue\n  FROM customers c\n  JOIN orders o ON o.customer_id = c.customer_id\n  WHERE o.status = 'completed'\n  GROUP BY c.customer_id, c.customer_name, c.country\n)\nSELECT *,\n       ROUND(100.0 * revenue /\n         NULLIF(SUM(revenue) OVER (PARTITION BY country), 0), 2) AS country_revenue_pct\nFROM customer_revenue\nORDER BY country, revenue DESC;",
    "expectedQuery": "WITH customer_revenue AS (\n  SELECT c.customer_id, c.customer_name, c.country,\n         SUM(o.total_amount) AS revenue\n  FROM customers c\n  JOIN orders o ON o.customer_id = c.customer_id\n  WHERE o.status = 'completed'\n  GROUP BY c.customer_id, c.customer_name, c.country\n)\nSELECT *,\n       ROUND(100.0 * revenue /\n         NULLIF(SUM(revenue) OVER (PARTITION BY country), 0), 2) AS country_revenue_pct\nFROM customer_revenue\nORDER BY country, revenue DESC;",
    "hints": [
      "Category: Window Functions. Relational logic: window-functions, aggregation.",
      "Target columns: *, country_revenue_pct"
    ],
    "tags": [
      "window-functions",
      "aggregation"
    ]
  },
  {
    "id": "ADVSQL-042",
    "number": 42,
    "title": "Order value outliers using IQR",
    "difficulty": "Hard",
    "category": "CTEs & Aggregation",
    "description": "Return completed orders whose total_amount lies outside 1.5 × IQR fences, using continuous quartiles.",
    "schemaRequirements": [
      "orders"
    ],
    "expectedColumns": [
      "order_id",
      "customer_id",
      "total_amount"
    ],
    "initialQuery": "-- Challenge ADVSQL-042: Order value outliers using IQR\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "WITH q AS (\n  SELECT percentile_cont(0.25) WITHIN GROUP (ORDER BY total_amount) AS q1,\n         percentile_cont(0.75) WITHIN GROUP (ORDER BY total_amount) AS q3\n  FROM orders\n  WHERE status = 'completed'\n)\nSELECT o.order_id, o.customer_id, o.total_amount\nFROM orders o CROSS JOIN q\nWHERE o.status = 'completed'\n  AND (o.total_amount < q.q1 - 1.5 * (q.q3 - q.q1)\n    OR o.total_amount > q.q3 + 1.5 * (q.q3 - q.q1))\nORDER BY o.total_amount DESC;",
    "mysqlSql": "SELECT o.order_id, o.customer_id, o.total_amount\nFROM orders o\nWHERE o.status = 'completed'\n  AND o.total_amount > (SELECT AVG(total_amount) * 1.5 FROM orders WHERE status = 'completed')\nORDER BY o.total_amount DESC;",
    "expectedQuery": "SELECT o.order_id, o.customer_id, o.total_amount\nFROM orders o\nWHERE o.status = 'completed'\n  AND o.total_amount > (SELECT AVG(total_amount) * 1.5 FROM orders WHERE status = 'completed')\nORDER BY o.total_amount DESC;",
    "hints": [
      "Category: CTEs & Aggregation. Relational logic: aggregations & joins.",
      "Target columns: order_id, customer_id, total_amount"
    ],
    "tags": []
  },
  {
    "id": "ADVSQL-043",
    "number": 43,
    "title": "Mutually exclusive order statuses by customer",
    "difficulty": "Hard",
    "category": "Joins & Subqueries",
    "description": "For each customer with orders, return counts of completed, cancelled, and pending orders in one row.",
    "schemaRequirements": [
      "orders"
    ],
    "expectedColumns": [
      "customer_id",
      "completed_orders",
      "cancelled_orders",
      "pending_orders"
    ],
    "initialQuery": "-- Challenge ADVSQL-043: Mutually exclusive order statuses by customer\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "SELECT customer_id,\n       COUNT(*) FILTER (WHERE status = 'completed') AS completed_orders,\n       COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled_orders,\n       COUNT(*) FILTER (WHERE status = 'pending') AS pending_orders\nFROM orders\nGROUP BY customer_id\nORDER BY customer_id;",
    "mysqlSql": "SELECT customer_id,\n       COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed_orders,\n       COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelled_orders,\n       COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending_orders\nFROM orders\nGROUP BY customer_id\nORDER BY customer_id;",
    "expectedQuery": "SELECT customer_id,\n       COUNT(*) FILTER (WHERE status = 'completed') AS completed_orders,\n       COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled_orders,\n       COUNT(*) FILTER (WHERE status = 'pending') AS pending_orders\nFROM orders\nGROUP BY customer_id\nORDER BY customer_id;",
    "hints": [
      "Category: Joins & Subqueries. Relational logic: aggregation.",
      "Target columns: customer_id, completed_orders, cancelled_orders, pending_orders"
    ],
    "tags": [
      "aggregation"
    ]
  },
  {
    "id": "ADVSQL-044",
    "number": 44,
    "title": "Department salary budget utilization",
    "difficulty": "Hard",
    "category": "Window Functions",
    "description": "For each department, calculate total payroll and its percentage of the sum of payroll across all departments. Include empty departments.",
    "schemaRequirements": [
      "departments",
      "employees"
    ],
    "expectedColumns": [
      "*",
      "payroll_pct"
    ],
    "initialQuery": "-- Challenge ADVSQL-044: Department salary budget utilization\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "WITH payroll AS (\n  SELECT d.department_id, d.department_name,\n         COALESCE(SUM(e.salary), 0) AS total_payroll\n  FROM departments d\n  LEFT JOIN employees e ON e.department_id = d.department_id\n  GROUP BY d.department_id, d.department_name\n)\nSELECT *,\n       ROUND(100.0 * total_payroll /\n         NULLIF(SUM(total_payroll) OVER (), 0), 2) AS payroll_pct\nFROM payroll\nORDER BY total_payroll DESC;",
    "mysqlSql": "WITH payroll AS (\n  SELECT d.department_id, d.department_name,\n         COALESCE(SUM(e.salary), 0) AS total_payroll\n  FROM departments d\n  LEFT JOIN employees e ON e.department_id = d.department_id\n  GROUP BY d.department_id, d.department_name\n)\nSELECT *,\n       ROUND(100.0 * total_payroll /\n         NULLIF(SUM(total_payroll) OVER (), 0), 2) AS payroll_pct\nFROM payroll\nORDER BY total_payroll DESC;",
    "expectedQuery": "WITH payroll AS (\n  SELECT d.department_id, d.department_name,\n         COALESCE(SUM(e.salary), 0) AS total_payroll\n  FROM departments d\n  LEFT JOIN employees e ON e.department_id = d.department_id\n  GROUP BY d.department_id, d.department_name\n)\nSELECT *,\n       ROUND(100.0 * total_payroll /\n         NULLIF(SUM(total_payroll) OVER (), 0), 2) AS payroll_pct\nFROM payroll\nORDER BY total_payroll DESC;",
    "hints": [
      "Category: Window Functions. Relational logic: window-functions, aggregation.",
      "Target columns: *, payroll_pct"
    ],
    "tags": [
      "window-functions",
      "aggregation"
    ]
  },
  {
    "id": "ADVSQL-045",
    "number": 45,
    "title": "Employee hierarchy path",
    "difficulty": "Hard",
    "category": "Recursive CTEs",
    "description": "Using a recursive CTE, return each employee and a text path from the top-level manager to that employee. Assume the hierarchy has no cycles.",
    "schemaRequirements": [
      "employees"
    ],
    "expectedColumns": [
      "employee_id",
      "employee_name",
      "manager_id",
      "path",
      "depth"
    ],
    "initialQuery": "-- Challenge ADVSQL-045: Employee hierarchy path\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "WITH RECURSIVE org AS (\n  SELECT employee_id, employee_name, manager_id,\n         employee_name::text AS path,\n         1 AS depth\n  FROM employees\n  WHERE manager_id IS NULL\n  UNION ALL\n  SELECT e.employee_id, e.employee_name, e.manager_id,\n         org.path || ' > ' || e.employee_name,\n         org.depth + 1\n  FROM employees e\n  JOIN org ON e.manager_id = org.employee_id\n)\nSELECT employee_id, employee_name, manager_id, path, depth\nFROM org\nORDER BY path;",
    "mysqlSql": "WITH RECURSIVE org AS (\n  SELECT employee_id, employee_name, manager_id,\n         CAST(employee_name AS CHAR(200)) AS path,\n         1 AS depth\n  FROM employees\n  WHERE manager_id IS NULL\n  UNION ALL\n  SELECT e.employee_id, e.employee_name, e.manager_id,\n         CONCAT(org.path, ' > ', e.employee_name),\n         org.depth + 1\n  FROM employees e\n  JOIN org ON e.manager_id = org.employee_id\n)\nSELECT employee_id, employee_name, manager_id, path, depth\nFROM org\nORDER BY path;",
    "expectedQuery": "WITH RECURSIVE org AS (\n  SELECT employee_id, employee_name, manager_id,\n         employee_name AS path,\n         1 AS depth\n  FROM employees\n  WHERE manager_id IS NULL\n  UNION ALL\n  SELECT e.employee_id, e.employee_name, e.manager_id,\n         org.path || ' > ' || e.employee_name,\n         org.depth + 1\n  FROM employees e\n  JOIN org ON e.manager_id = org.employee_id\n)\nSELECT employee_id, employee_name, manager_id, path, depth\nFROM org\nORDER BY path;",
    "hints": [
      "Category: Recursive CTEs. Relational logic: recursive-cte.",
      "Target columns: employee_id, employee_name, manager_id, path, depth"
    ],
    "tags": [
      "recursive-cte"
    ]
  },
  {
    "id": "ADVSQL-046",
    "number": 46,
    "title": "All reports under a manager",
    "difficulty": "Hard",
    "category": "Recursive CTEs",
    "description": "For a supplied manager ID (replace :manager_id with a literal or bind parameter), return all direct and indirect reports, with depth.",
    "schemaRequirements": [
      "employees"
    ],
    "expectedColumns": [
      "employee_id",
      "employee_name",
      "manager_id",
      "depth"
    ],
    "initialQuery": "-- Challenge ADVSQL-046: All reports under a manager\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "WITH RECURSIVE reports AS (\n  SELECT employee_id, employee_name, manager_id, 1 AS depth\n  FROM employees\n  WHERE manager_id = 1\n  UNION ALL\n  SELECT e.employee_id, e.employee_name, e.manager_id, r.depth + 1\n  FROM employees e\n  JOIN reports r ON e.manager_id = r.employee_id\n)\nSELECT employee_id, employee_name, manager_id, depth\nFROM reports\nORDER BY depth, employee_id;",
    "mysqlSql": "WITH RECURSIVE reports AS (\n  SELECT employee_id, employee_name, manager_id, 1 AS depth\n  FROM employees\n  WHERE manager_id = 1\n  UNION ALL\n  SELECT e.employee_id, e.employee_name, e.manager_id, r.depth + 1\n  FROM employees e\n  JOIN reports r ON e.manager_id = r.employee_id\n)\nSELECT employee_id, employee_name, manager_id, depth\nFROM reports\nORDER BY depth, employee_id;",
    "expectedQuery": "WITH RECURSIVE reports AS (\n  SELECT employee_id, employee_name, manager_id, 1 AS depth\n  FROM employees\n  WHERE manager_id = 1\n  UNION ALL\n  SELECT e.employee_id, e.employee_name, e.manager_id, r.depth + 1\n  FROM employees e\n  JOIN reports r ON e.manager_id = r.employee_id\n)\nSELECT employee_id, employee_name, manager_id, depth\nFROM reports\nORDER BY depth, employee_id;",
    "hints": [
      "Category: Recursive CTEs. Relational logic: recursive-cte.",
      "Target columns: employee_id, employee_name, manager_id, depth"
    ],
    "tags": [
      "recursive-cte"
    ]
  },
  {
    "id": "ADVSQL-047",
    "number": 47,
    "title": "Detect employee hierarchy cycles",
    "difficulty": "Hard",
    "category": "Recursive CTEs",
    "description": "Return employees that are encountered again along their own manager/report traversal. This is a defensive cycle detector.",
    "schemaRequirements": [
      "employees"
    ],
    "expectedColumns": [
      "employee_id"
    ],
    "initialQuery": "-- Challenge ADVSQL-047: Detect employee hierarchy cycles\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "WITH RECURSIVE walk AS (\n  SELECT employee_id AS start_id, employee_id, manager_id,\n         ARRAY[employee_id] AS path, FALSE AS cycle\n  FROM employees\n  UNION ALL\n  SELECT w.start_id, e.employee_id, e.manager_id,\n         w.path || e.employee_id,\n         e.employee_id = ANY(w.path) AS cycle\n  FROM walk w\n  JOIN employees e ON e.employee_id = w.manager_id\n  WHERE NOT w.cycle\n)\nSELECT DISTINCT start_id AS employee_id\nFROM walk\nWHERE cycle\nORDER BY employee_id;",
    "mysqlSql": "SELECT DISTINCT employee_id FROM employees WHERE manager_id IS NOT NULL;",
    "expectedQuery": "SELECT DISTINCT employee_id FROM employees WHERE manager_id IS NOT NULL ORDER BY employee_id;",
    "hints": [
      "Category: Recursive CTEs. Relational logic: recursive-cte.",
      "Target columns: employee_id"
    ],
    "tags": [
      "recursive-cte"
    ]
  },
  {
    "id": "ADVSQL-048",
    "number": 48,
    "title": "Employees sharing the same salary",
    "difficulty": "Hard",
    "category": "Joins & Subqueries",
    "description": "Return salary values shared by at least two employees and the employees earning each shared salary.",
    "schemaRequirements": [
      "employees"
    ],
    "expectedColumns": [
      "employee_id",
      "employee_name",
      "salary"
    ],
    "initialQuery": "-- Challenge ADVSQL-048: Employees sharing the same salary\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "SELECT e.employee_id, e.employee_name, e.salary\nFROM employees e\nJOIN (\n  SELECT salary\n  FROM employees\n  GROUP BY salary\n  HAVING COUNT(*) >= 2\n) s ON s.salary = e.salary\nORDER BY e.salary DESC, e.employee_id;",
    "mysqlSql": "SELECT e.employee_id, e.employee_name, e.salary\nFROM employees e\nJOIN (\n  SELECT salary\n  FROM employees\n  GROUP BY salary\n  HAVING COUNT(*) >= 2\n) s ON s.salary = e.salary\nORDER BY e.salary DESC, e.employee_id;",
    "expectedQuery": "SELECT e.employee_id, e.employee_name, e.salary\nFROM employees e\nJOIN (\n  SELECT salary\n  FROM employees\n  GROUP BY salary\n  HAVING COUNT(*) >= 2\n) s ON s.salary = e.salary\nORDER BY e.salary DESC, e.employee_id;",
    "hints": [
      "Category: Joins & Subqueries. Relational logic: aggregation.",
      "Target columns: employee_id, employee_name, salary"
    ],
    "tags": [
      "aggregation"
    ]
  },
  {
    "id": "ADVSQL-049",
    "number": 49,
    "title": "Find duplicate customer emails",
    "difficulty": "Hard",
    "category": "Joins & Subqueries",
    "description": "Return normalized email values used by multiple customers, with the number of occurrences.",
    "schemaRequirements": [
      "customers"
    ],
    "expectedColumns": [
      "normalized_email",
      "occurrences"
    ],
    "initialQuery": "-- Challenge ADVSQL-049: Find duplicate customer emails\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "SELECT LOWER(TRIM(email)) AS normalized_email,\n       COUNT(*) AS occurrences\nFROM customers\nWHERE email IS NOT NULL\nGROUP BY LOWER(TRIM(email))\nHAVING COUNT(*) > 1\nORDER BY occurrences DESC, normalized_email;",
    "mysqlSql": "SELECT LOWER(TRIM(email)) AS normalized_email,\n       COUNT(*) AS occurrences\nFROM customers\nWHERE email IS NOT NULL\nGROUP BY LOWER(TRIM(email))\nHAVING COUNT(*) > 1\nORDER BY occurrences DESC, normalized_email;",
    "expectedQuery": "SELECT LOWER(TRIM(email)) AS normalized_email,\n       COUNT(*) AS occurrences\nFROM customers\nWHERE email IS NOT NULL\nGROUP BY LOWER(TRIM(email))\nHAVING COUNT(*) > 1\nORDER BY occurrences DESC, normalized_email;",
    "hints": [
      "Category: Joins & Subqueries. Relational logic: aggregation.",
      "Target columns: normalized_email, occurrences"
    ],
    "tags": [
      "aggregation"
    ]
  },
  {
    "id": "ADVSQL-050",
    "number": 50,
    "title": "Orders with missing or inconsistent line items",
    "difficulty": "Hard",
    "category": "CTEs & Aggregation",
    "description": "Return orders that have no line items or whose sum of line-item extended values differs from total_amount by more than 0.01.",
    "schemaRequirements": [
      "orders",
      "order_items"
    ],
    "expectedColumns": [
      "order_id",
      "total_amount",
      "item_total",
      "item_count"
    ],
    "initialQuery": "-- Challenge ADVSQL-050: Orders with missing or inconsistent line items\n-- Select Dialect: MySQL or PostgreSQL\n\n",
    "postgresSql": "WITH item_totals AS (\n  SELECT o.order_id, o.total_amount,\n         COALESCE(SUM(oi.quantity * oi.unit_price *\n           (1 - COALESCE(oi.discount_pct, 0) / 100.0)), 0) AS item_total,\n         COUNT(oi.order_item_id) AS item_count\n  FROM orders o\n  LEFT JOIN order_items oi ON oi.order_id = o.order_id\n  GROUP BY o.order_id, o.total_amount\n)\nSELECT order_id, total_amount, item_total, item_count\nFROM item_totals\nWHERE item_count = 0 OR ABS(total_amount - item_total) > 0.01\nORDER BY order_id;",
    "mysqlSql": "WITH item_totals AS (\n  SELECT o.order_id, o.total_amount,\n         COALESCE(SUM(oi.quantity * oi.unit_price *\n           (1 - COALESCE(oi.discount_pct, 0) / 100.0)), 0) AS item_total,\n         COUNT(oi.order_item_id) AS item_count\n  FROM orders o\n  LEFT JOIN order_items oi ON oi.order_id = o.order_id\n  GROUP BY o.order_id, o.total_amount\n)\nSELECT order_id, total_amount, item_total, item_count\nFROM item_totals\nWHERE item_count = 0 OR ABS(total_amount - item_total) > 0.01\nORDER BY order_id;",
    "expectedQuery": "WITH item_totals AS (\n  SELECT o.order_id, o.total_amount,\n         COALESCE(SUM(oi.quantity * oi.unit_price *\n           (1 - COALESCE(oi.discount_pct, 0) / 100.0)), 0) AS item_total,\n         COUNT(oi.order_item_id) AS item_count\n  FROM orders o\n  LEFT JOIN order_items oi ON oi.order_id = o.order_id\n  GROUP BY o.order_id, o.total_amount\n)\nSELECT order_id, total_amount, item_total, item_count\nFROM item_totals\nWHERE item_count = 0 OR ABS(total_amount - item_total) > 0.01\nORDER BY order_id;",
    "hints": [
      "Category: CTEs & Aggregation. Relational logic: aggregation.",
      "Target columns: order_id, total_amount, item_total, item_count"
    ],
    "tags": [
      "aggregation"
    ]
  }
];
