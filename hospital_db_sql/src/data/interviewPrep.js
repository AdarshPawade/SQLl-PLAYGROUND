// High-frequency Technical SQL Interview Preparation Scenarios
export const INTERVIEW_CHALLENGES = [
  {
    id: 'int_1',
    title: 'Top 3 Salaries per Department (Dense Rank)',
    company: 'Meta / Amazon',
    difficulty: 'Hard',
    category: 'Window Functions',
    database: 'employee_db',
    description: 'Find employees who earn the top 3 highest salaries within their respective departments. Display department_name, employee_name, and salary. Duplicate salaries should be assigned the same rank.',
    initialQuery: `-- Write your SQL solution using DENSE_RANK()\nSELECT d.department_name, e.first_name || ' ' || e.last_name AS employee_name, s.amount AS salary\nFROM employees e\nJOIN departments d ON e.department_id = d.department_id\nJOIN salaries s ON e.employee_id = s.employee_id;`,
    expectedQuery: `WITH RankedSalaries AS (
  SELECT e.first_name || ' ' || e.last_name AS employee_name, d.department_name, s.amount AS salary,
         DENSE_RANK() OVER (PARTITION BY d.department_id ORDER BY s.amount DESC) as rnk
  FROM employees e
  JOIN departments d ON e.department_id = d.department_id
  JOIN salaries s ON e.employee_id = s.employee_id
)
SELECT department_name, employee_name, salary
FROM RankedSalaries
WHERE rnk <= 3;`,
    verificationQuery: `WITH RankedSalaries AS (
  SELECT e.first_name || ' ' || e.last_name AS employee_name, d.department_name, s.amount AS salary,
         DENSE_RANK() OVER (PARTITION BY d.department_id ORDER BY s.amount DESC) as rnk
  FROM employees e
  JOIN departments d ON e.department_id = d.department_id
  JOIN salaries s ON e.employee_id = s.employee_id
)
SELECT department_name, employee_name, salary
FROM RankedSalaries
WHERE rnk <= 3;`,
    hints: [
      'Use the DENSE_RANK() window function partitioned by department_id and ordered by salary descending.',
      'Wrap the window function in a Common Table Expression (CTE) or subquery so you can filter where rnk <= 3.'
    ],
    explanation: 'DENSE_RANK() does not skip rank values when ties exist, ensuring all employees tied for top 3 salaries are included. Filtering window functions requires a CTE or derived table because window functions evaluate after WHERE and GROUP BY clauses.'
  },
  {
    id: 'int_2',
    title: 'Detect Unadmitted High-Risk Patients',
    company: 'Google Health / Mayo Clinic',
    difficulty: 'Medium',
    category: 'Subqueries & Set Operations',
    database: 'hospital_db',
    description: 'Identify all patients who have smart equipment registered to them but do NOT have any active admission record (where discharge_date IS NULL). Display patient full_name and date_of_birth.',
    initialQuery: `-- Identify unadmitted patients who own telemetry devices\nSELECT full_name, date_of_birth\nFROM patients\nWHERE patient_id IN (\n  SELECT patient_id FROM smart_equipment\n);`,
    expectedQuery: `SELECT full_name, date_of_birth
FROM patients
WHERE patient_id IN (SELECT patient_id FROM smart_equipment)
  AND patient_id NOT IN (SELECT patient_id FROM admissions WHERE discharge_date IS NULL);`,
    verificationQuery: `SELECT full_name, date_of_birth
FROM patients
WHERE patient_id IN (SELECT patient_id FROM smart_equipment)
  AND patient_id NOT IN (SELECT patient_id FROM admissions WHERE discharge_date IS NULL);`,
    hints: [
      'Combine IN for smart equipment ownership with NOT IN (or NOT EXISTS) for active admissions.',
      'Active admissions are records where discharge_date IS NULL.'
    ],
    explanation: 'Using subqueries with NOT IN isolates patients who own IoMT hardware but lack active admission supervision, flagging them for proactive healthcare outreach.'
  },
  {
    id: 'int_3',
    title: 'Department Salary Expenditure vs Company Average',
    company: 'Apple / Goldman Sachs',
    difficulty: 'Medium',
    category: 'Aggregations & HAVING',
    database: 'employee_db',
    description: 'Calculate total salary budget per department. Output department_name and total_spending, but ONLY for departments whose total spending exceeds the average department spending across the entire company.',
    initialQuery: `-- Calculate total department spending higher than the overall average department spending\nSELECT d.department_name, SUM(s.amount) AS total_spending\nFROM departments d\nJOIN employees e ON d.department_id = e.department_id\nJOIN salaries s ON e.employee_id = s.employee_id\nGROUP BY d.department_id, d.department_name;`,
    expectedQuery: `SELECT d.department_name, SUM(s.amount) AS total_spending
FROM departments d
JOIN employees e ON d.department_id = e.department_id
JOIN salaries s ON e.employee_id = s.employee_id
GROUP BY d.department_id, d.department_name
HAVING SUM(s.amount) > (
  SELECT AVG(dept_total)
  FROM (
    SELECT SUM(s2.amount) AS dept_total
    FROM employees e2
    JOIN salaries s2 ON e2.employee_id = s2.employee_id
    GROUP BY e2.department_id
  )
);`,
    verificationQuery: `SELECT d.department_name, SUM(s.amount) AS total_spending
FROM departments d
JOIN employees e ON d.department_id = e.department_id
JOIN salaries s ON e.employee_id = s.employee_id
GROUP BY d.department_id, d.department_name
HAVING SUM(s.amount) > (
  SELECT AVG(dept_total)
  FROM (
    SELECT SUM(s2.amount) AS dept_total
    FROM employees e2
    JOIN salaries s2 ON e2.employee_id = s2.employee_id
    GROUP BY e2.department_id
  )
);`,
    hints: [
      'Use GROUP BY on department_name with SUM(salaries.amount).',
      'Use a HAVING clause containing a subquery that calculates the AVG of total department spending.'
    ],
    explanation: 'The HAVING clause filters aggregated groups. The nested subquery computes average department budget company-wide, enabling financial variance comparison.'
  },
  {
    id: 'int_4',
    title: 'Identify Peer Doctors with Same Specialization',
    company: 'Microsoft / Uber',
    difficulty: 'Medium',
    category: 'Self Joins',
    database: 'hospital_db',
    description: 'Perform a Self Join on the doctors table to find pairs of doctors who share the exact same specialization. Avoid matching a doctor with themselves and avoid duplicate mirror pairs (e.g. show (Doctor A, Doctor B) but not (Doctor B, Doctor A)). Display doctor_1, doctor_2, and specialization.',
    initialQuery: `-- Perform self-join to list peer doctor pairs\nSELECT d1.first_name || ' ' || d1.last_name AS doctor_1,\n       d2.first_name || ' ' || d2.last_name AS doctor_2,\n       d1.specialization\nFROM doctors d1\nJOIN doctors d2 ON d1.specialization = d2.specialization;`,
    expectedQuery: `SELECT d1.first_name || ' ' || d1.last_name AS doctor_1,
       d2.first_name || ' ' || d2.last_name AS doctor_2,
       d1.specialization
FROM doctors d1
JOIN doctors d2 ON d1.specialization = d2.specialization AND d1.doctor_id < d2.doctor_id;`,
    verificationQuery: `SELECT d1.first_name || ' ' || d1.last_name AS doctor_1,
       d2.first_name || ' ' || d2.last_name AS doctor_2,
       d1.specialization
FROM doctors d1
JOIN doctors d2 ON d1.specialization = d2.specialization AND d1.doctor_id < d2.doctor_id;`,
    hints: [
      'Join doctors d1 with doctors d2 on d1.specialization = d2.specialization.',
      'Add the condition d1.doctor_id < d2.doctor_id to eliminate duplicate mirrored pairs and self-matches.'
    ],
    explanation: 'Using `d1.doctor_id < d2.doctor_id` in a self-join guarantees distinct pairs without symmetric duplicates (A,B and B,A) or self-pairing (A,A).'
  },
  {
    id: 'int_5',
    title: 'Cross-Project Allocation Multi-Join',
    company: 'Netflix / Snowflake',
    difficulty: 'Hard',
    category: 'Multi-Table Joins & CTEs',
    database: 'employee_db',
    description: 'List all employees assigned to more than 1 active project. Display employee name, department name, total assigned projects count, and total allocated hours across all projects.',
    initialQuery: `-- Write multi-join with CTE/Aggregation\nSELECT e.first_name || ' ' || e.last_name AS employee_name, d.department_name\nFROM employees e\nJOIN departments d ON e.department_id = d.department_id;`,
    expectedQuery: `SELECT e.first_name || ' ' || e.last_name AS employee_name,
       d.department_name,
       COUNT(ep.project_id) AS total_projects,
       SUM(ep.hours_allocated) AS total_hours
FROM employees e
JOIN departments d ON e.department_id = d.department_id
JOIN employee_projects ep ON e.employee_id = ep.employee_id
GROUP BY e.employee_id, employee_name, d.department_name
HAVING COUNT(ep.project_id) > 1;`,
    verificationQuery: `SELECT e.first_name || ' ' || e.last_name AS employee_name,
       d.department_name,
       COUNT(ep.project_id) AS total_projects,
       SUM(ep.hours_allocated) AS total_hours
FROM employees e
JOIN departments d ON e.department_id = d.department_id
JOIN employee_projects ep ON e.employee_id = ep.employee_id
GROUP BY e.employee_id, employee_name, d.department_name
HAVING COUNT(ep.project_id) > 1;`,
    hints: [
      'Join employees, departments, and employee_projects junction table.',
      'Group by employee ID and name, then apply HAVING COUNT(ep.project_id) > 1.'
    ],
    explanation: 'Junction tables manage many-to-many relationships. Aggregating across the join with HAVING isolates multi-project resource allocation.'
  }
];
