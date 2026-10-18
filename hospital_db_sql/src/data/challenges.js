// 160 SQL Challenges: Beginner (50 Qs), Intermediate (50 Qs), Pro (60 Qs)
// Mapped to Employee Database (80 Qs) and Hospital Database (80 Qs)
// All seed string data, expected queries, hints, and initial queries are strictly lowercased.

export const ALL_CHALLENGES = {
  // ==========================================
  // 1. EMPLOYEE DATABASE QUESTION BANK (80 Qs)
  // ==========================================
  employee_db: {
    Beginner: [
      {
        id: 'emp_beg_1',
        title: '1. Create Departments Table',
        badge: 'CREATE TABLE',
        description: 'Create a table named `departments` with `department_id` (INTEGER PRIMARY KEY), `department_name` (VARCHAR(50)), and `location` (VARCHAR(50)).',
        hint: 'Use create table departments (department_id integer primary key, department_name varchar(50), location varchar(50));',
        initialQuery: '-- create departments table\ncreate table departments (\n  \n);',
        expectedQuery: 'create table departments (department_id integer primary key, department_name varchar(50), location varchar(50));',
        verificationQuery: "select name from sqlite_master where type='table' and lower(name)='departments';"
      },
      {
        id: 'emp_beg_2',
        title: '2. Insert Human Resources Department',
        badge: 'INSERT INTO',
        description: 'Insert a new department record: `department_id` = 6, `department_name` = "human resources", and `location` = "building a".',
        hint: 'Use insert into departments (department_id, department_name, location) values (6, "human resources", "building a");',
        initialQuery: '-- insert human resources department\ninsert into departments (department_id, department_name, location)\nvalues ();',
        expectedQuery: "insert into departments (department_id, department_name, location) values (6, 'human resources', 'building a');",
        verificationQuery: "select * from departments where department_id = 6;"
      },
      {
        id: 'emp_beg_3',
        title: '3. Extract All Employees',
        badge: 'SELECT *',
        description: 'Extract all rows and columns from the `employees` table.',
        hint: 'Use select * from employees;',
        initialQuery: '-- extract all employee records\nselect ',
        expectedQuery: 'select * from employees;'
      },
      {
        id: 'emp_beg_4',
        title: '4. Extract Employee Names and Emails',
        badge: 'COLUMN FILTER',
        description: 'Extract only the `first_name` and `email` columns for all employees.',
        hint: 'Select specific columns: select first_name, email from employees;',
        initialQuery: '-- extract first_name and email\nselect ',
        expectedQuery: 'select first_name, email from employees;'
      },
      {
        id: 'emp_beg_5',
        title: '5. Update Department Location',
        badge: 'UPDATE',
        description: 'Update the `location` of the department with `department_id = 2` to "building c".',
        hint: 'Use update departments set location = "building c" where department_id = 2;',
        initialQuery: '-- update location for department 2\nupdate departments\nset \nwhere ',
        expectedQuery: "update departments set location = 'building c' where department_id = 2;",
        verificationQuery: "select * from departments where department_id = 2;"
      },
      {
        id: 'emp_beg_6',
        title: '6. Insert New Employee Profile',
        badge: 'INSERT INTO',
        description: 'Insert a new employee into `employees`: `employee_id` = 7, `first_name` = "george", `last_name` = "clark", `email` = "george.c@company.com", `hire_date` = "2024-03-01", `department_id` = 1.',
        hint: 'Use insert into employees (employee_id, first_name, last_name, email, hire_date, department_id) values ...',
        initialQuery: '-- insert new employee\ninsert into employees (employee_id, first_name, last_name, email, hire_date, department_id)\nvalues ();',
        expectedQuery: "insert into employees (employee_id, first_name, last_name, email, hire_date, department_id) values (7, 'george', 'clark', 'george.c@company.com', '2024-03-01', 1);",
        verificationQuery: "select * from employees where employee_id = 7;"
      },
      {
        id: 'emp_beg_7',
        title: '7. Update Employee Surname',
        badge: 'UPDATE',
        description: 'Update the `last_name` of the employee with `employee_id = 5` to "smith".',
        hint: 'Use update employees set last_name = "smith" where employee_id = 5;',
        initialQuery: '-- update last_name for employee 5\nupdate employees\nset \nwhere ',
        expectedQuery: "update employees set last_name = 'smith' where employee_id = 5;",
        verificationQuery: "select * from employees where employee_id = 5;"
      },
      {
        id: 'emp_beg_8',
        title: '8. Extract All Projects',
        badge: 'SELECT *',
        description: 'Extract all columns from the `projects` table.',
        hint: 'Use select * from projects;',
        initialQuery: '-- extract all projects\nselect ',
        expectedQuery: 'select * from projects;'
      },
      {
        id: 'emp_beg_9',
        title: '9. Extract Project Names and Budgets',
        badge: 'COLUMN FILTER',
        description: 'Extract only the `project_name` and `budget` columns from `projects`.',
        hint: 'Select project_name, budget from projects;',
        initialQuery: '-- extract project name and budget\nselect ',
        expectedQuery: 'select project_name, budget from projects;'
      },
      {
        id: 'emp_beg_10',
        title: '10. Link Employee to Project',
        badge: 'INSERT INTO',
        description: 'Insert a record into `employee_projects` linking `employee_id = 1` and `project_id = 3` with 20 `hours_allocated`.',
        hint: 'Insert (1, 3, 20) into employee_projects.',
        initialQuery: '-- link employee 1 to project 3\ninsert into employee_projects (employee_id, project_id, hours_allocated)\nvalues (1, 3, 20);',
        expectedQuery: 'insert into employee_projects (employee_id, project_id, hours_allocated) values (1, 3, 20);',
        verificationQuery: "select * from employee_projects where employee_id = 1 and project_id = 3;"
      },
      {
        id: 'emp_beg_11',
        title: '11. Extract Employees Hired Before 2023',
        badge: 'WHERE FILTER',
        description: 'Extract all employee records from `employees` hired before "2023-01-01".',
        hint: 'Use select * from employees where hire_date < "2023-01-01";',
        initialQuery: '-- extract staff hired before 2023\nselect * from employees\nwhere ',
        expectedQuery: "select * from employees where hire_date < '2023-01-01';"
      },
      {
        id: 'emp_beg_12',
        title: '12. Extract Department 1 Employees',
        badge: 'WHERE FILTER',
        description: 'Extract all employee records assigned to `department_id = 1`.',
        hint: 'Use select * from employees where department_id = 1;',
        initialQuery: '-- extract staff in department 1\nselect * from employees\nwhere ',
        expectedQuery: 'select * from employees where department_id = 1;'
      },
      {
        id: 'emp_beg_13',
        title: '13. Extract High Salary Records',
        badge: 'WHERE FILTER',
        description: 'Extract all records from `salaries` where `amount` is greater than 80000.',
        hint: 'Use select * from salaries where amount > 80000;',
        initialQuery: '-- extract salaries > 80000\nselect * from salaries\nwhere ',
        expectedQuery: 'select * from salaries where amount > 80000;'
      },
      {
        id: 'emp_beg_14',
        title: '14. Extract Major Projects',
        badge: 'WHERE FILTER',
        description: 'Extract all project records from `projects` where `budget` is 100000 or greater.',
        hint: 'Use select * from projects where budget >= 100000;',
        initialQuery: '-- extract projects budget >= 100000\nselect * from projects\nwhere ',
        expectedQuery: 'select * from projects where budget >= 100000;'
      },
      {
        id: 'emp_beg_15',
        title: '15. Delete Project Record',
        badge: 'DELETE FROM',
        description: 'Delete the project record from `projects` where `project_id = 5`.',
        hint: 'Use delete from projects where project_id = 5;',
        initialQuery: '-- delete project 5\ndelete from projects\nwhere ',
        expectedQuery: 'delete from projects where project_id = 5;',
        verificationQuery: 'select * from projects;'
      },
      {
        id: 'emp_beg_16',
        title: '16. Sort Employees by Hire Date',
        badge: 'ORDER BY',
        description: 'Select all employees from `employees` sorted by `hire_date` in ascending order.',
        hint: 'Use select * from employees order by hire_date asc;',
        initialQuery: '-- sort employees by hire_date\nselect * from employees\norder by ',
        expectedQuery: 'select * from employees order by hire_date asc;'
      },
      {
        id: 'emp_beg_17',
        title: '17. Extract Top 3 Project Budgets',
        badge: 'ORDER BY & LIMIT',
        description: 'Extract the top 3 projects with highest budgets from `projects`.',
        hint: 'Use select * from projects order by budget desc limit 3;',
        initialQuery: '-- top 3 highest budget projects\nselect * from projects\n',
        expectedQuery: 'select * from projects order by budget desc limit 3;'
      },
      {
        id: 'emp_beg_18',
        title: '18. Update Employee Salary',
        badge: 'UPDATE',
        description: 'Update `salaries` setting `amount = 95000` for `employee_id = 1`.',
        hint: 'Use update salaries set amount = 95000 where employee_id = 1;',
        initialQuery: '-- update salary for employee 1\nupdate salaries\nset \nwhere ',
        expectedQuery: 'update salaries set amount = 95000 where employee_id = 1;',
        verificationQuery: 'select * from salaries where employee_id = 1;'
      },
      {
        id: 'emp_beg_19',
        title: '19. Insert New Project Record',
        badge: 'INSERT INTO',
        description: 'Insert a new project into `projects`: `project_id = 6`, `project_name = "project zenith"`, `budget = 120000`, `deadline = "2025-06-30"`.',
        hint: 'Use insert into projects (project_id, project_name, budget, deadline) values (6, "project zenith", 120000, "2025-06-30");',
        initialQuery: '-- insert project zenith\ninsert into projects (project_id, project_name, budget, deadline)\nvalues ();',
        expectedQuery: "insert into projects (project_id, project_name, budget, deadline) values (6, 'project zenith', 120000, '2025-06-30');",
        verificationQuery: 'select * from projects where project_id = 6;'
      },
      {
        id: 'emp_beg_20',
        title: '20. Extract Employee Email',
        badge: 'WHERE FILTER',
        description: 'Extract the `email` of the employee whose `first_name` is "alice".',
        hint: 'Use select email from employees where first_name = "alice";',
        initialQuery: '-- extract email for alice\nselect email from employees\nwhere ',
        expectedQuery: "select email from employees where first_name = 'alice';"
      },
      {
        id: 'emp_beg_21',
        title: '21. Distinct Department Locations',
        badge: 'SELECT DISTINCT',
        description: 'Extract all unique facility locations from the `departments` table.',
        hint: 'Use select distinct location from departments;',
        initialQuery: '-- extract distinct locations\nselect distinct ',
        expectedQuery: 'select distinct location from departments;'
      },
      {
        id: 'emp_beg_22',
        title: '22. Staff Hired in 2023',
        badge: 'BETWEEN FILTER',
        description: 'Select all employees hired between "2023-01-01" and "2023-12-31".',
        hint: 'Use select * from employees where hire_date between "2023-01-01" and "2023-12-31";',
        initialQuery: '-- staff hired in 2023\nselect * from employees\nwhere hire_date between ',
        expectedQuery: "select * from employees where hire_date between '2023-01-01' and '2023-12-31';"
      },
      {
        id: 'emp_beg_23',
        title: '23. Project Deadlines in 2024',
        badge: 'LIKE PATTERN',
        description: 'Select `project_name` and `deadline` from `projects` where deadline starts with "2024".',
        hint: 'Use select project_name, deadline from projects where deadline like "2024%";',
        initialQuery: '-- projects with 2024 deadlines\nselect project_name, deadline from projects\nwhere ',
        expectedQuery: "select project_name, deadline from projects where deadline like '2024%';"
      },
      {
        id: 'emp_beg_24',
        title: '24. Employees in Department 1 or 2',
        badge: 'IN OPERATOR',
        description: 'Select all employees assigned to department_id 1 or 2.',
        hint: 'Use select * from employees where department_id in (1, 2);',
        initialQuery: '-- staff in department 1 or 2\nselect * from employees\nwhere department_id in ',
        expectedQuery: 'select * from employees where department_id in (1, 2);'
      },
      {
        id: 'emp_beg_25',
        title: '25. Total Count of Departments',
        badge: 'COUNT AGGREGATE',
        description: 'Calculate the total number of records in the `departments` table.',
        hint: 'Use select count(*) as total_departments from departments;',
        initialQuery: '-- count total departments\nselect count(*) as total_departments from ',
        expectedQuery: 'select count(*) as total_departments from departments;'
      }
    ],
    Intermediate: [
      {
        id: 'emp_int_1',
        title: '1. Count Total Employees',
        badge: 'COUNT() AGGREGATE',
        description: 'Calculate the total number of employees in the `employees` table.',
        hint: 'Use count(*): select count(*) as total_employees from employees;',
        initialQuery: '-- total count of employees\nselect count(*) as total_employees\nfrom ',
        expectedQuery: 'select count(*) as total_employees from employees;'
      },
      {
        id: 'emp_int_2',
        title: '2. Average Salary Calculation',
        badge: 'AVG() AGGREGATE',
        description: 'Compute the average salary from the `salaries` table.',
        hint: 'Use avg(amount): select avg(amount) as avg_salary from salaries;',
        initialQuery: '-- calculate average salary\nselect avg(amount) as avg_salary\nfrom ',
        expectedQuery: 'select avg(amount) as avg_salary from salaries;'
      },
      {
        id: 'emp_int_3',
        title: '3. Total Project Budget Allocation',
        badge: 'SUM() AGGREGATE',
        description: 'Calculate the sum of all project budgets from the `projects` table.',
        hint: 'Use sum(budget): select sum(budget) as total_budget from projects;',
        initialQuery: '-- sum total project budgets\nselect sum(budget) as total_budget\nfrom ',
        expectedQuery: 'select sum(budget) as total_budget from projects;'
      },
      {
        id: 'emp_int_4',
        title: '4. Maximum and Minimum Salary',
        badge: 'MIN/MAX AGGREGATE',
        description: 'Select the maximum and minimum salary amounts from `salaries`.',
        hint: 'Use max(amount) and min(amount): select max(amount) as max_sal, min(amount) as min_sal from salaries;',
        initialQuery: '-- max and min salary\nselect max(amount) as max_sal, min(amount) as min_sal\nfrom ',
        expectedQuery: 'select max(amount) as max_sal, min(amount) as min_sal from salaries;'
      },
      {
        id: 'emp_int_5',
        title: '5. Staff Count Per Department',
        badge: 'GROUP BY',
        description: 'Group employees by `department_id` and count the number of staff in each department.',
        hint: 'Group by department_id: select department_id, count(*) as emp_count from employees group by department_id;',
        initialQuery: '-- employee count per department\nselect department_id, count(*) as emp_count\nfrom employees\ngroup by ',
        expectedQuery: 'select department_id, count(*) as emp_count from employees group by department_id;'
      },
      {
        id: 'emp_int_6',
        title: '6. Filter Departments with Multiple Staff',
        badge: 'HAVING CLAUSE',
        description: 'Select `department_id` and staff count for departments having 2 or more employees.',
        hint: 'Use HAVING count(*) >= 2 after GROUP BY department_id.',
        initialQuery: '-- departments with staff count >= 2\nselect department_id, count(*) as emp_count\nfrom employees\ngroup by department_id\nhaving ',
        expectedQuery: 'select department_id, count(*) as emp_count from employees group by department_id having count(*) >= 2;'
      },
      {
        id: 'emp_int_7',
        title: '7. Subquery: Salaries Above Average',
        badge: 'SCALAR SUBQUERY',
        description: 'Select all salary records from `salaries` where `amount` is strictly greater than the average salary.',
        hint: 'Use subquery: select * from salaries where amount > (select avg(amount) from salaries);',
        initialQuery: '-- salaries exceeding average\nselect * from salaries\nwhere amount > (select avg(amount) from salaries);',
        expectedQuery: 'select * from salaries where amount > (select avg(amount) from salaries);'
      },
      {
        id: 'emp_int_8',
        title: '8. Subquery: Staff in Engineering or HR',
        badge: 'IN SUBQUERY',
        description: 'Select all employees working in departments located in "building a" or "building b".',
        hint: 'Use subquery: select * from employees where department_id in (select department_id from departments where location in ("building a", "building b"));',
        initialQuery: '-- employees in building a or b\nselect * from employees\nwhere department_id in (select department_id from departments where location in (\'building a\', \'building b\'));',
        expectedQuery: "select * from employees where department_id in (select department_id from departments where location in ('building a', 'building b'));"
      },
      {
        id: 'emp_int_9',
        title: '9. Subquery: Employees Assigned to Projects',
        badge: 'EXISTS SUBQUERY',
        description: 'Select all employees who have at least one entry in `employee_projects`.',
        hint: 'Use EXISTS subquery: select * from employees e where exists (select 1 from employee_projects ep where ep.employee_id = e.employee_id);',
        initialQuery: '-- employees with project assignments\nselect * from employees e\nwhere exists (select 1 from employee_projects ep where ep.employee_id = e.employee_id);',
        expectedQuery: 'select * from employees e where exists (select 1 from employee_projects ep where ep.employee_id = e.employee_id);'
      },
      {
        id: 'emp_int_10',
        title: '10. LIKE Pattern Matching for Surnames',
        badge: 'LIKE OPERATOR',
        description: 'Select all employees whose `first_name` starts with the letter "a".',
        hint: 'Use select * from employees where first_name like "a%";',
        initialQuery: '-- staff with first name starting with a\nselect * from employees\nwhere first_name like ',
        expectedQuery: "select * from employees where first_name like 'a%';"
      },
      {
        id: 'emp_int_11',
        title: '11. BETWEEN Range Filter for Salaries',
        badge: 'BETWEEN OPERATOR',
        description: 'Select all salary records from `salaries` where `amount` is between 65000 and 90000.',
        hint: 'Use select * from salaries where amount between 65000 and 90000;',
        initialQuery: '-- salaries between 65000 and 90000\nselect * from salaries\nwhere amount between ',
        expectedQuery: 'select * from salaries where amount between 65000 and 90000;'
      },
      {
        id: 'emp_int_12',
        title: '12. IN List Operator for Departments',
        badge: 'IN OPERATOR',
        description: 'Select all department records where `department_id` is 1, 3, or 5.',
        hint: 'Use select * from departments where department_id in (1, 3, 5);',
        initialQuery: '-- departments 1, 3, or 5\nselect * from departments\nwhere department_id in ',
        expectedQuery: 'select * from departments where department_id in (1, 3, 5);'
      },
      {
        id: 'emp_int_13',
        title: '13. String Concatenation Full Name',
        badge: 'STRING CONCAT',
        description: 'Select `first_name || " " || last_name` as `full_name` for all employees.',
        hint: 'Use select first_name || " " || last_name as full_name from employees;',
        initialQuery: '-- full name concatenation\nselect first_name || \' \' || last_name as full_name\nfrom ',
        expectedQuery: "select first_name || ' ' || last_name as full_name from employees;"
      },
      {
        id: 'emp_int_14',
        title: '14. Date Formatting Extraction',
        badge: 'STRFTIME DATE',
        description: 'Select `first_name` and the year of hire `strftime("%Y", hire_date)` as `hire_year` from `employees`.',
        hint: 'Use strftime("%Y", hire_date) as hire_year.',
        initialQuery: '-- extract hire year\nselect first_name, strftime(\'%Y\', hire_date) as hire_year\nfrom employees;',
        expectedQuery: "select first_name, strftime('%Y', hire_date) as hire_year from employees;"
      },
      {
        id: 'emp_int_15',
        title: '15. NULL Inspection Check',
        badge: 'IS NULL / IS NOT NULL',
        description: 'Select all employees whose `department_id` is NOT NULL.',
        hint: 'Use select * from employees where department_id is not null;',
        initialQuery: '-- staff with assigned department\nselect * from employees\nwhere department_id is not null;',
        expectedQuery: 'select * from employees where department_id is not null;'
      },
      {
        id: 'emp_int_16',
        title: '16. Total Hours Allocated to Projects',
        badge: 'SUM AGGREGATE',
        description: 'Compute the total sum of `hours_allocated` across all employee project allocations.',
        hint: 'Use select sum(hours_allocated) as total_hours from employee_projects;',
        initialQuery: '-- total allocated hours\nselect sum(hours_allocated) as total_hours\nfrom ',
        expectedQuery: 'select sum(hours_allocated) as total_hours from employee_projects;'
      },
      {
        id: 'emp_int_17',
        title: '17. Highest Single Salary Record',
        badge: 'MAX AGGREGATE',
        description: 'Select the single highest salary `amount` from `salaries`.',
        hint: 'Use select max(amount) as top_salary from salaries;',
        initialQuery: '-- highest salary amount\nselect max(amount) as top_salary\nfrom salaries;',
        expectedQuery: 'select max(amount) as top_salary from salaries;'
      },
      {
        id: 'emp_int_18',
        title: '18. Filter Projects by Deadline Year',
        badge: 'LIKE DATE FILTER',
        description: 'Select all projects where `deadline` is in year 2024.',
        hint: 'Use select * from projects where deadline like "2024%";',
        initialQuery: '-- projects ending in 2024\nselect * from projects\nwhere deadline like ',
        expectedQuery: "select * from projects where deadline like '2024%';"
      },
      {
        id: 'emp_int_19',
        title: '19. Average Budget of Major Projects',
        badge: 'AVG & WHERE',
        description: 'Compute the average budget of projects with a budget >= 50000.',
        hint: 'Use select avg(budget) as avg_major_budget from projects where budget >= 50000;',
        initialQuery: '-- average budget major projects\nselect avg(budget) as avg_major_budget\nfrom projects\nwhere ',
        expectedQuery: 'select avg(budget) as avg_major_budget from projects where budget >= 50000;'
      },
      {
        id: 'emp_int_20',
        title: '20. Total Hours Allocated per Project',
        badge: 'GROUP BY & SUM',
        description: 'Group `employee_projects` by `project_id` and compute the total `hours_allocated` per project.',
        hint: 'SELECT project_id, SUM(hours_allocated) AS total_hours FROM employee_projects GROUP BY project_id;',
        initialQuery: '-- total allocated hours per project\nselect project_id, sum(hours_allocated) as total_hours\nfrom employee_projects\ngroup by ',
        expectedQuery: 'select project_id, sum(hours_allocated) as total_hours from employee_projects group by project_id;'
      },
      {
        id: 'emp_int_21',
        title: '21. Corporate Email Domain Filter',
        badge: 'LIKE OPERATOR',
        description: 'Select all employees whose email ends with "@company.com".',
        hint: 'Use select * from employees where email like "%@company.com";',
        initialQuery: '-- staff with corporate email\nselect * from employees\nwhere email like ',
        expectedQuery: "select * from employees where email like '%@company.com';"
      },
      {
        id: 'emp_int_22',
        title: '22. Staff Count per Department Name',
        badge: 'JOIN & GROUP BY',
        description: 'Join `employees` and `departments` to output `department_name` and count of staff.',
        hint: 'Use select d.department_name, count(e.employee_id) as emp_cnt from departments d left join employees e on d.department_id = e.department_id group by d.department_name;',
        initialQuery: '-- staff count by department name\nselect d.department_name, count(e.employee_id) as emp_cnt\nfrom departments d\nleft join employees e on d.department_id = e.department_id\ngroup by ',
        expectedQuery: 'select d.department_name, count(e.employee_id) as emp_cnt from departments d left join employees e on d.department_id = e.department_id group by d.department_name;'
      },
      {
        id: 'emp_int_23',
        title: '23. Projects with Budget under 100k',
        badge: 'FILTER & ORDER BY',
        description: 'Select `project_name` and `budget` for projects with budget < 100000 ordered by budget asc.',
        hint: 'Use select project_name, budget from projects where budget < 100000 order by budget asc;',
        initialQuery: '-- projects budget < 100000\nselect project_name, budget from projects\nwhere budget < 100000\norder by ',
        expectedQuery: 'select project_name, budget from projects where budget < 100000 order by budget asc;'
      },
      {
        id: 'emp_int_24',
        title: '24. Average Allocated Hours per Staff',
        badge: 'AVG AGGREGATE',
        description: 'Compute the average `hours_allocated` across all employee project records.',
        hint: 'Use select avg(hours_allocated) as avg_hours from employee_projects;',
        initialQuery: '-- avg allocated hours\nselect avg(hours_allocated) as avg_hours from ',
        expectedQuery: 'select avg(hours_allocated) as avg_hours from employee_projects;'
      },
      {
        id: 'emp_int_25',
        title: '25. Departments with Total Salary Spending over 100k',
        badge: 'JOIN, GROUP & HAVING',
        description: 'Group salaries by department and filter departments spending over 100000.',
        hint: 'Use select e.department_id, sum(s.amount) as total_spend from employees e join salaries s on e.employee_id = s.employee_id group by e.department_id having total_spend > 100000;',
        initialQuery: '-- department spending over 100k\nselect e.department_id, sum(s.amount) as total_spend\nfrom employees e\njoin salaries s on e.employee_id = s.employee_id\ngroup by e.department_id\nhaving ',
        expectedQuery: 'select e.department_id, sum(s.amount) as total_spend from employees e join salaries s on e.employee_id = s.employee_id group by e.department_id having total_spend > 100000;'
      }
    ],
    Pro: [
      {
        id: 'emp_pro_1',
        title: '1. INNER JOIN Employees & Departments',
        badge: 'INNER JOIN',
        description: 'Write an INNER JOIN to combine `employees` and `departments`. Display `first_name`, `last_name`, and `department_name`.',
        hint: 'JOIN departments ON employees.department_id = departments.department_id.',
        initialQuery: '-- inner join employees and departments\nselect e.first_name, e.last_name, d.department_name\nfrom employees e\njoin departments d on ',
        expectedQuery: 'select e.first_name, e.last_name, d.department_name from employees e join departments d on e.department_id = d.department_id;'
      },
      {
        id: 'emp_pro_2',
        title: '2. Unassigned Staff (LEFT JOIN & IS NULL)',
        badge: 'LEFT JOIN & IS NULL',
        description: 'Find departments that currently have no assigned employees using LEFT JOIN and WHERE `employee_id IS NULL`.',
        hint: 'SELECT d.department_name FROM departments d LEFT JOIN employees e ON d.department_id = e.department_id WHERE e.employee_id IS NULL;',
        initialQuery: '-- departments without staff\nselect d.department_name\nfrom departments d\nleft join employees e on d.department_id = e.department_id\nwhere ',
        expectedQuery: 'select d.department_name from departments d left join employees e on d.department_id = e.department_id where e.employee_id is null;'
      },
      {
        id: 'emp_pro_3',
        title: '3. Department with Highest Salary Expenditure',
        badge: 'MULTI-TABLE JOIN & GROUP',
        description: 'Find the department name and total salary spending for the department that spends the most on salaries.',
        hint: 'Join employees, departments, salaries. Group by department_name ORDER BY SUM(amount) DESC LIMIT 1.',
        initialQuery: '-- top salary spending department\nselect d.department_name, sum(s.amount) as total_payroll\nfrom departments d\njoin employees e on d.department_id = e.department_id\njoin salaries s on e.employee_id = s.employee_id\ngroup by d.department_name\norder by total_payroll desc\nlimit 1;',
        expectedQuery: 'select d.department_name, sum(s.amount) as total_payroll from departments d join employees e on d.department_id = e.department_id join salaries s on e.employee_id = s.employee_id group by d.department_name order by total_payroll desc limit 1;'
      },
      {
        id: 'emp_pro_4',
        title: '4. CREATE VIEW ActiveProjects',
        badge: 'CREATE VIEW',
        description: 'Create a SQL View named `ActiveProjects` that selects `project_id`, `project_name`, and `budget` from `projects` where `budget > 40000`.',
        hint: 'CREATE VIEW ActiveProjects AS SELECT project_id, project_name, budget FROM projects WHERE budget > 40000;',
        initialQuery: '-- create view activeprojects\ncreate view ActiveProjects as\nselect ',
        expectedQuery: 'create view ActiveProjects as select project_id, project_name, budget from projects where budget > 40000;',
        verificationQuery: "select name from sqlite_master where type='table' and lower(name)='activeprojects';"
      },
      {
        id: 'emp_pro_5',
        title: '5. Query ActiveProjects View Total Budget',
        badge: 'QUERY VIEW',
        description: 'Select the SUM of budgets from the `ActiveProjects` view created in the previous challenge.',
        hint: 'SELECT SUM(budget) AS total_active_budget FROM ActiveProjects;',
        initialQuery: '-- sum budget from activeprojects view\nselect sum(budget) as total_active_budget\nfrom ActiveProjects;',
        expectedQuery: 'create view if not exists ActiveProjects as select project_id, project_name, budget from projects where budget > 40000; select sum(budget) as total_active_budget from ActiveProjects;'
      },
      {
        id: 'emp_pro_6',
        title: '6. CREATE INDEX on Email Column',
        badge: 'CREATE INDEX',
        description: 'Create an index named `idx_employee_email` on the `email` column of the `employees` table.',
        hint: 'CREATE INDEX idx_employee_email ON employees(email);',
        initialQuery: '-- create index on email\ncreate index idx_employee_email\non employees();',
        expectedQuery: 'create index idx_employee_email on employees(email);',
        verificationQuery: "select name from sqlite_master where type='index' and lower(name)='idx_employee_email';"
      },
      {
        id: 'emp_pro_7',
        title: '7. Create Composite Index on Employee Names',
        badge: 'COMPOSITE INDEX',
        description: 'Create a composite index named `idx_emp_names` on `first_name` and `last_name` in `employees`.',
        hint: 'CREATE INDEX idx_emp_names ON employees(first_name, last_name);',
        initialQuery: '-- create composite index\ncreate index idx_emp_names\non employees(first_name, last_name);',
        expectedQuery: 'create index idx_emp_names on employees(first_name, last_name);',
        verificationQuery: "select name from sqlite_master where type='index' and lower(name)='idx_emp_names';"
      },
      {
        id: 'emp_pro_8',
        title: '8. Transaction Commit Workflow',
        badge: 'TRANSACTIONS',
        description: 'Execute a transaction: BEGIN TRANSACTION, insert department 7 "quality assurance", "building b", and COMMIT.',
        hint: 'BEGIN TRANSACTION; INSERT INTO departments VALUES (7, "quality assurance", "building b"); COMMIT;',
        initialQuery: '-- transaction commit workflow\nbegin transaction;\ninsert into departments (department_id, department_name, location)\nvalues (7, \'quality assurance\', \'building b\');\ncommit;',
        expectedQuery: "begin transaction; insert into departments (department_id, department_name, location) values (7, 'quality assurance', 'building b'); commit;",
        verificationQuery: 'select * from departments where department_id = 7;'
      },
      {
        id: 'emp_pro_9',
        title: '9. Transaction Delete Safety Check',
        badge: 'TRANSACTION DELETE',
        description: 'Begin transaction, delete department 7, and commit.',
        hint: 'BEGIN TRANSACTION; DELETE FROM departments WHERE department_id = 7; COMMIT;',
        initialQuery: '-- safe delete transaction\nbegin transaction;\ndelete from departments where department_id = 7;\ncommit;',
        expectedQuery: 'begin transaction; delete from departments where department_id = 7; commit;',
        verificationQuery: 'select * from departments;'
      },
      {
        id: 'emp_pro_10',
        title: '10. Safe Table Drop (DROP TABLE IF EXISTS)',
        badge: 'DROP TABLE',
        description: 'Safely drop table `temp_audit` if it exists.',
        hint: 'DROP TABLE IF EXISTS temp_audit;',
        initialQuery: '-- safe drop table\ndrop table if exists temp_audit;',
        expectedQuery: 'drop table if exists temp_audit;',
        verificationQuery: "select name from sqlite_master where type='table' and lower(name)='temp_audit';"
      },
      {
        id: 'emp_pro_11',
        title: '11. Alter Table Add Phone Number',
        badge: 'ALTER TABLE',
        description: 'Add a new column `phone` (VARCHAR(20)) to the `employees` table using ALTER TABLE.',
        hint: 'ALTER TABLE employees ADD COLUMN phone VARCHAR(20);',
        initialQuery: '-- alter table add column\nalter table employees\nadd column phone varchar(20);',
        expectedQuery: 'alter table employees add column phone varchar(20);',
        verificationQuery: 'select * from employees;'
      },
      {
        id: 'emp_pro_12',
        title: '12. Clear Table Records (DELETE / TRUNCATE)',
        badge: 'DELETE ALL',
        description: 'Clear all records from `employee_projects` table.',
        hint: 'DELETE FROM employee_projects;',
        initialQuery: '-- clear table records\ndelete from employee_projects;',
        expectedQuery: 'delete from employee_projects;',
        verificationQuery: 'select count(*) from employee_projects;'
      },
      {
        id: 'emp_pro_13',
        title: '13. Parameterized Safe Email Query',
        badge: 'SECURITY & PARAMETERS',
        description: 'Select employee details for `email = "alice.walker@company.com"`.',
        hint: 'SELECT * FROM employees WHERE email = "alice.walker@company.com";',
        initialQuery: '-- safe parameterized email lookup\nselect * from employees\nwhere email = \'alice.walker@company.com\';',
        expectedQuery: "select * from employees where email = 'alice.walker@company.com';"
      },
      {
        id: 'emp_pro_14',
        title: '14. SQL Injection Mechanics Demonstration',
        badge: 'SECURITY DEMO',
        description: 'Demonstrate safe sanitization by querying employee `employee_id = 1`.',
        hint: 'SELECT * FROM employees WHERE employee_id = 1;',
        initialQuery: '-- safe parameter query\nselect * from employees where employee_id = 1;',
        expectedQuery: 'select * from employees where employee_id = 1;'
      },
      {
        id: 'emp_pro_15',
        title: '15. Rank Employees by Salary within Department',
        badge: 'WINDOW DENSE_RANK()',
        description: 'Use DENSE_RANK() OVER (PARTITION BY employee_id ORDER BY amount DESC) on salaries.',
        hint: 'DENSE_RANK() OVER (PARTITION BY employee_id ORDER BY amount DESC).',
        initialQuery: '-- rank salaries\nselect employee_id, amount, dense_rank() over (partition by employee_id order by amount desc) as rnk\nfrom salaries;',
        expectedQuery: 'select employee_id, amount, dense_rank() over (partition by employee_id order by amount desc) as rnk from salaries;'
      },
      {
        id: 'emp_pro_16',
        title: '16. Assign Row Numbers to Projects by Budget',
        badge: 'WINDOW ROW_NUMBER()',
        description: 'Use ROW_NUMBER() OVER (ORDER BY budget DESC) on `projects`.',
        hint: 'ROW_NUMBER() OVER (ORDER BY budget DESC).',
        initialQuery: '-- assign row numbers to projects\nselect project_name, budget, row_number() over (order by budget desc) as row_num\nfrom projects;',
        expectedQuery: 'select project_name, budget, row_number() over (order by budget desc) as row_num from projects;'
      },
      {
        id: 'emp_pro_17',
        title: '17. CTE Average Salary per Department',
        badge: 'CTE (WITH)',
        description: 'Write a CTE named `deptsalaries` to compute AVG(amount) per employee.',
        hint: 'WITH deptsalaries AS (SELECT employee_id, AVG(amount) as avg_sal FROM salaries GROUP BY employee_id) SELECT * FROM deptsalaries;',
        initialQuery: '-- cte average salary\nwith deptsalaries as (\n  select employee_id, avg(amount) as avg_sal from salaries group by employee_id\n)\nselect * from deptsalaries;',
        expectedQuery: 'with deptsalaries as (select employee_id, avg(amount) as avg_sal from salaries group by employee_id) select * from deptsalaries;'
      },
      {
        id: 'emp_pro_18',
        title: '18. Top Allocated Staff CTE',
        badge: 'CTE (WITH)',
        description: 'Write a CTE `topallocated` finding staff with hours_allocated > 15.',
        hint: 'WITH topallocated AS (SELECT employee_id, hours_allocated FROM employee_projects WHERE hours_allocated > 15) SELECT * FROM topallocated;',
        initialQuery: '-- cte top allocated staff\nwith topallocated as (\n  select employee_id, hours_allocated from employee_projects where hours_allocated > 15\n)\nselect * from topallocated;',
        expectedQuery: 'with topallocated as (select employee_id, hours_allocated from employee_projects where hours_allocated > 15) select * from topallocated;'
      },
      {
        id: 'emp_pro_19',
        title: '19. Total Staff Hours on Project Alpha',
        badge: 'JOIN & SUM',
        description: 'Sum allocated hours for project "project alpha".',
        hint: 'Join projects and employee_projects WHERE project_name = "project alpha".',
        initialQuery: '-- total staff hours project alpha\nselect p.project_name, sum(ep.hours_allocated) as total_hours\nfrom projects p\njoin employee_projects ep on p.project_id = ep.project_id\nwhere p.project_name = \'project alpha\'\ngroup by p.project_name;',
        expectedQuery: "select p.project_name, sum(ep.hours_allocated) as total_hours from projects p join employee_projects ep on p.project_id = ep.project_id where p.project_name = 'project alpha' group by p.project_name;"
      },
      {
        id: 'emp_pro_20',
        title: '20. High Budget Projects Summary',
        badge: 'FILTER & ORDER',
        description: 'Select project_name and budget for all projects with a budget of 50000 or greater, ordered by budget descending.',
        hint: 'SELECT project_name, budget FROM projects WHERE budget >= 50000 ORDER BY budget DESC;',
        initialQuery: '-- high budget projects summary\nselect project_name, budget\nfrom projects\nwhere budget >= 50000\norder by budget desc;',
        expectedQuery: 'select project_name, budget from projects where budget >= 50000 order by budget desc;'
      },
      {
        id: 'emp_pro_21',
        title: '21. Difference from Highest Company Salary',
        badge: 'SUBQUERY MATH',
        description: 'Calculate (MAX(amount) - amount) for each salary record.',
        hint: 'SELECT amount, ((SELECT MAX(amount) FROM salaries) - amount) AS diff FROM salaries;',
        initialQuery: '-- difference from max salary\nselect amount, ((select max(amount) from salaries) - amount) as diff\nfrom salaries;',
        expectedQuery: 'select amount, ((select max(amount) from salaries) - amount) as diff from salaries;'
      },
      {
        id: 'emp_pro_22',
        title: '22. Self Join Employees with Same Hire Date',
        badge: 'SELF JOIN',
        description: 'Self-join employees to find pairs hired on the same date.',
        hint: 'JOIN employees e2 ON e1.hire_date = e2.hire_date AND e1.employee_id < e2.employee_id.',
        initialQuery: '-- self join same hire date\nselect e1.first_name as emp1, e2.first_name as emp2, e1.hire_date\nfrom employees e1\njoin employees e2 on e1.hire_date = e2.hire_date and e1.employee_id < e2.employee_id;',
        expectedQuery: 'select e1.first_name as emp1, e2.first_name as emp2, e1.hire_date from employees e1 join employees e2 on e1.hire_date = e2.hire_date and e1.employee_id < e2.employee_id;'
      },
      {
        id: 'emp_pro_23',
        title: '23. Subquery Update Salary 5% Increase',
        badge: 'UPDATE SUBQUERY',
        description: 'Increase salary amount by 5% for employee 1.',
        hint: 'UPDATE salaries SET amount = amount * 1.05 WHERE employee_id = 1;',
        initialQuery: '-- 5% salary increase\nupdate salaries set amount = amount * 1.05 where employee_id = 1;',
        expectedQuery: 'update salaries set amount = amount * 1.05 where employee_id = 1;',
        verificationQuery: 'select * from salaries where employee_id = 1;'
      },
      {
        id: 'emp_pro_24',
        title: '24. DROP VIEW ActiveProjects',
        badge: 'DROP VIEW',
        description: 'Safely drop view `ActiveProjects` if it exists.',
        hint: 'DROP VIEW IF EXISTS ActiveProjects;',
        initialQuery: '-- drop view activeprojects\ndrop view if exists ActiveProjects;',
        expectedQuery: 'drop view if exists ActiveProjects;',
        verificationQuery: "select name from sqlite_master where type='view' and lower(name)='activeprojects';"
      },
      {
        id: 'emp_pro_25',
        title: '25. DROP INDEX idx_employee_email',
        badge: 'DROP INDEX',
        description: 'Safely drop index `idx_employee_email` if it exists.',
        hint: 'DROP INDEX IF EXISTS idx_employee_email;',
        initialQuery: '-- drop index employee email\ndrop index if exists idx_employee_email;',
        expectedQuery: 'drop index if exists idx_employee_email;',
        verificationQuery: "select name from sqlite_master where type='index' and lower(name)='idx_employee_email';"
      },
      {
        id: 'emp_pro_26',
        title: '26. Dense Rank Projects by Budget',
        badge: 'WINDOW DENSE_RANK()',
        description: 'Assign dense rank to projects ordered by budget descending.',
        hint: 'Use select project_name, budget, dense_rank() over (order by budget desc) as rnk from projects;',
        initialQuery: '-- dense rank projects by budget\nselect project_name, budget, dense_rank() over (order by budget desc) as rnk\nfrom projects;',
        expectedQuery: 'select project_name, budget, dense_rank() over (order by budget desc) as rnk from projects;'
      },
      {
        id: 'emp_pro_27',
        title: '27. CTE Heavy Workload Staff',
        badge: 'CTE (WITH)',
        description: 'Write a CTE `heavy_workload` selecting employee_id and hours_allocated >= 30.',
        hint: 'Use with heavy_workload as (select employee_id, hours_allocated from employee_projects where hours_allocated >= 30) select * from heavy_workload;',
        initialQuery: '-- cte heavy workload staff\nwith heavy_workload as (\n  select employee_id, hours_allocated from employee_projects where hours_allocated >= 30\n)\nselect * from heavy_workload;',
        expectedQuery: 'with heavy_workload as (select employee_id, hours_allocated from employee_projects where hours_allocated >= 30) select * from heavy_workload;'
      },
      {
        id: 'emp_pro_28',
        title: '28. Subquery Staff Earning Above Average',
        badge: 'CORRELATED SUBQUERY',
        description: 'Select employee_id and amount from salaries where amount > (select avg(amount) from salaries).',
        hint: 'Use select employee_id, amount from salaries where amount > (select avg(amount) from salaries);',
        initialQuery: '-- staff earning above avg salary\nselect employee_id, amount from salaries\nwhere amount > (select avg(amount) from salaries);',
        expectedQuery: 'select employee_id, amount from salaries where amount > (select avg(amount) from salaries);'
      },
      {
        id: 'emp_pro_29',
        title: '29. Lag Salary Comparison',
        badge: 'WINDOW LAG()',
        description: 'Use LAG(amount, 1) OVER (ORDER BY salary_id) to retrieve previous salary amount.',
        hint: 'Use select employee_id, amount, lag(amount, 1) over (order by salary_id) as prev_sal from salaries;',
        initialQuery: '-- lag salary comparison\nselect employee_id, amount, lag(amount, 1) over (order by salary_id) as prev_sal\nfrom salaries;',
        expectedQuery: 'select employee_id, amount, lag(amount, 1) over (order by salary_id) as prev_sal from salaries;'
      },
      {
        id: 'emp_pro_30',
        title: '30. Safe Table Drop Temp Projects',
        badge: 'DROP TABLE',
        description: 'Safely drop table `temp_projects` if it exists.',
        hint: 'DROP TABLE IF EXISTS temp_projects;',
        initialQuery: '-- safe drop temp projects\ndrop table if exists temp_projects;',
        expectedQuery: 'drop table if exists temp_projects;',
        verificationQuery: "select name from sqlite_master where type='table' and lower(name)='temp_projects';"
      }
    ]
  },

  // ==========================================
  // 2. HOSPITAL DATABASE QUESTION BANK (80 Qs)
  // ==========================================
  hospital_db: {
    Beginner: [
      {
        id: 'hosp_beg_1',
        title: '1. Create Doctors Table',
        badge: 'CREATE TABLE',
        description: 'Create table `doctors` with `doctor_id` (INTEGER PRIMARY KEY), `first_name` (VARCHAR(50)), `last_name` (VARCHAR(50)), and `specialization` (VARCHAR(50)).',
        hint: 'Use create table doctors (doctor_id integer primary key, first_name varchar(50), last_name varchar(50), specialization varchar(50));',
        initialQuery: '-- create doctors table\ncreate table doctors (\n  \n);',
        expectedQuery: 'create table doctors (doctor_id integer primary key, first_name varchar(50), last_name varchar(50), specialization varchar(50));',
        verificationQuery: "select name from sqlite_master where type='table' and lower(name)='doctors';"
      },
      {
        id: 'hosp_beg_2',
        title: '2. Register New Patient Profile',
        badge: 'INSERT INTO',
        description: 'Insert new patient record: `patient_id = 6`, `full_name = "emily davis"`, `date_of_birth = "1992-04-10"`, `contact_number = "555-0106"`, `emergency_contact = "555-9906"`.',
        hint: 'Insert into patients values (6, "emily davis", "1992-04-10", "555-0106", "555-9906");',
        initialQuery: '-- insert new patient\ninsert into patients (patient_id, full_name, date_of_birth, contact_number, emergency_contact)\nvalues ();',
        expectedQuery: "insert into patients (patient_id, full_name, date_of_birth, contact_number, emergency_contact) values (6, 'emily davis', '1992-04-10', '555-0106', '555-9906');",
        verificationQuery: 'select * from patients where patient_id = 6;'
      },
      {
        id: 'hosp_beg_3',
        title: '3. Extract All Patients Directory',
        badge: 'SELECT *',
        description: 'Extract all columns and rows from the `patients` table.',
        hint: 'Use select * from patients;',
        initialQuery: '-- select all patients\nselect ',
        expectedQuery: 'select * from patients;'
      },
      {
        id: 'hosp_beg_4',
        title: '4. Extract Patient Name and Emergency Phone',
        badge: 'COLUMN FILTER',
        description: 'Select `full_name` and `emergency_contact` columns for all patients.',
        hint: 'Select full_name, emergency_contact from patients;',
        initialQuery: '-- patient full_name and emergency contact\nselect ',
        expectedQuery: 'select full_name, emergency_contact from patients;'
      },
      {
        id: 'hosp_beg_5',
        title: '5. Update Hardware Telemetry Status',
        badge: 'UPDATE',
        description: 'Update `status = "maintenance"` in `smart_equipment` for `equipment_id = 10`.',
        hint: 'Update smart_equipment set status = "maintenance" where equipment_id = 10;',
        initialQuery: '-- update equipment status\nupdate smart_equipment\nset \nwhere ',
        expectedQuery: "update smart_equipment set status = 'maintenance' where equipment_id = 10;",
        verificationQuery: 'select * from smart_equipment where equipment_id = 10;'
      },
      {
        id: 'hosp_beg_6',
        title: '6. Register Attending Doctor',
        badge: 'INSERT INTO',
        description: 'Insert new doctor: `doctor_id = 206`, `first_name = "alice"`, `last_name = "smith"`, `specialization = "cardiology"`, `department_id = 1`.',
        hint: 'Insert into doctors values (206, "alice", "smith", "cardiology", 1);',
        initialQuery: '-- insert doctor alice smith\ninsert into doctors (doctor_id, first_name, last_name, specialization, department_id)\nvalues ();',
        expectedQuery: "insert into doctors (doctor_id, first_name, last_name, specialization, department_id) values (206, 'alice', 'smith', 'cardiology', 1);",
        verificationQuery: 'select * from doctors where doctor_id = 206;'
      },
      {
        id: 'hosp_beg_7',
        title: '7. Update Patient Contact Phone Number',
        badge: 'UPDATE',
        description: 'Update `contact_number = "555-8888"` for `patient_id = 1`.',
        hint: 'Update patients set contact_number = "555-8888" where patient_id = 1;',
        initialQuery: '-- update patient phone number\nupdate patients\nset \nwhere ',
        expectedQuery: "update patients set contact_number = '555-8888' where patient_id = 1;",
        verificationQuery: 'select * from patients where patient_id = 1;'
      },
      {
        id: 'hosp_beg_8',
        title: '8. Extract All Admissions Logs',
        badge: 'SELECT *',
        description: 'Select all records from `admissions` table.',
        hint: 'Select * from admissions;',
        initialQuery: '-- select all admissions\nselect ',
        expectedQuery: 'select * from admissions;'
      },
      {
        id: 'hosp_beg_9',
        title: '9. Extract Admission Dates and Room Numbers',
        badge: 'COLUMN FILTER',
        description: 'Select `patient_id`, `room_number`, and `admission_date` from `admissions`.',
        hint: 'Select patient_id, room_number, admission_date from admissions;',
        initialQuery: '-- admission dates and rooms\nselect ',
        expectedQuery: 'select patient_id, room_number, admission_date from admissions;'
      },
      {
        id: 'hosp_beg_10',
        title: '10. Create New Hospital Admission Record',
        badge: 'INSERT INTO',
        description: 'Insert admission: `admission_id = 306`, `patient_id = 1`, `doctor_id = 201`, `room_number = 104`, `admission_date = "2023-12-01"`, `discharge_date = NULL`.',
        hint: 'Insert into admissions values (306, 1, 201, 104, "2023-12-01", NULL);',
        initialQuery: '-- insert admission 306\ninsert into admissions (admission_id, patient_id, doctor_id, room_number, admission_date, discharge_date)\nvalues ();',
        expectedQuery: "insert into admissions (admission_id, patient_id, doctor_id, room_number, admission_date, discharge_date) values (306, 1, 201, 104, '2023-12-01', NULL);",
        verificationQuery: 'select * from admissions where admission_id = 306;'
      },
      {
        id: 'hosp_beg_11',
        title: '11. Extract Cardiology Physicians',
        badge: 'WHERE FILTER',
        description: 'Select all doctors specializing in "cardiology".',
        hint: 'Select * from doctors where specialization = "cardiology";',
        initialQuery: '-- cardiology doctors\nselect * from doctors\nwhere ',
        expectedQuery: "select * from doctors where specialization = 'cardiology';"
      },
      {
        id: 'hosp_beg_12',
        title: '12. Extract Room 101 Admissions',
        badge: 'WHERE FILTER',
        description: 'Select all admission records assigned to `room_number = 101`.',
        hint: 'Select * from admissions where room_number = 101;',
        initialQuery: '-- admissions room 101\nselect * from admissions\nwhere ',
        expectedQuery: 'select * from admissions where room_number = 101;'
      },
      {
        id: 'hosp_beg_13',
        title: '13. Extract Maintenance Equipment',
        badge: 'WHERE FILTER',
        description: 'Select all smart hardware records where `status = "maintenance"`.',
        hint: 'Select * from smart_equipment where status = "maintenance";',
        initialQuery: '-- equipment maintenance\nselect * from smart_equipment\nwhere ',
        expectedQuery: "select * from smart_equipment where status = 'maintenance';"
      },
      {
        id: 'hosp_beg_14',
        title: '14. Delete Outdated Equipment Log',
        badge: 'DELETE FROM',
        description: 'Delete telemetry record from `smart_equipment` where `equipment_id = 50`.',
        hint: 'Delete from smart_equipment where equipment_id = 50;',
        initialQuery: '-- delete hardware 50\ndelete from smart_equipment\nwhere ',
        expectedQuery: 'delete from smart_equipment where equipment_id = 50;',
        verificationQuery: 'select * from smart_equipment;'
      },
      {
        id: 'hosp_beg_15',
        title: '15. Sort Patients by Date of Birth',
        badge: 'ORDER BY',
        description: 'Select all patients sorted by `date_of_birth` in ascending order.',
        hint: 'Select * from patients order by date_of_birth asc;',
        initialQuery: '-- sort patients by dob\nselect * from patients\norder by ',
        expectedQuery: 'select * from patients order by date_of_birth asc;'
      },
      {
        id: 'hosp_beg_16',
        title: '16. Extract Top 3 Recent Hospital Admissions',
        badge: 'ORDER BY & LIMIT',
        description: 'Select top 3 recent admissions ordered by `admission_date` descending.',
        hint: 'Select * from admissions order by admission_date desc limit 3;',
        initialQuery: '-- top 3 recent admissions\nselect * from admissions\n',
        expectedQuery: 'select * from admissions order by admission_date desc limit 3;'
      },
      {
        id: 'hosp_beg_17',
        title: '17. Update Discharge Date for Patient Stay',
        badge: 'UPDATE',
        description: 'Update `admissions` setting `discharge_date = "2023-08-10"` for `admission_id = 302`.',
        hint: 'Update admissions set discharge_date = "2023-08-10" where admission_id = 302;',
        initialQuery: '-- update discharge date\nupdate admissions\nset \nwhere ',
        expectedQuery: "update admissions set discharge_date = '2023-08-10' where admission_id = 302;",
        verificationQuery: 'select * from admissions where admission_id = 302;'
      },
      {
        id: 'hosp_beg_18',
        title: '18. Register Smart Telemetry Unit',
        badge: 'INSERT INTO',
        description: 'Insert equipment: `equipment_id = 60`, `equipment_type = "pulse oximeter"`, `status = "active"`, `department_id = 1`, `patient_id = 1`, `last_calibration_date = "2023-10-01"`.',
        hint: 'Insert into smart_equipment values (60, "pulse oximeter", "active", 1, 1, "2023-10-01");',
        initialQuery: '-- insert smart hardware\ninsert into smart_equipment (equipment_id, equipment_type, status, department_id, patient_id, last_calibration_date)\nvalues ();',
        expectedQuery: "insert into smart_equipment (equipment_id, equipment_type, status, department_id, patient_id, last_calibration_date) values (60, 'pulse oximeter', 'active', 1, 1, '2023-10-01');",
        verificationQuery: 'select * from smart_equipment where equipment_id = 60;'
      },
      {
        id: 'hosp_beg_19',
        title: '19. Extract Patient Contact by Full Name',
        badge: 'WHERE FILTER',
        description: 'Extract `contact_number` for patient whose `full_name` is "robert chen".',
        hint: 'Select contact_number from patients where full_name = "robert chen";',
        initialQuery: '-- contact number robert chen\nselect contact_number from patients\nwhere ',
        expectedQuery: "select contact_number from patients where full_name = 'robert chen';"
      },
      {
        id: 'hosp_beg_20',
        title: '20. Extract Department 1 Medical Units',
        badge: 'WHERE FILTER',
        description: 'Select all medical departments located on `floor_number = 1`.',
        hint: 'Select * from departments where floor_number = 1;',
        initialQuery: '-- floor 1 departments\nselect * from departments\nwhere ',
        expectedQuery: 'select * from departments where floor_number = 1;'
      },
      {
        id: 'hosp_beg_21',
        title: '21. Distinct Doctor Specializations',
        badge: 'SELECT DISTINCT',
        description: 'Extract all unique medical specializations from the `doctors` table.',
        hint: 'Use select distinct specialization from doctors;',
        initialQuery: '-- extract distinct specializations\nselect distinct ',
        expectedQuery: 'select distinct specialization from doctors;'
      },
      {
        id: 'hosp_beg_22',
        title: '22. Patients Born Before 1990',
        badge: 'WHERE DATE FILTER',
        description: 'Select `full_name` and `date_of_birth` for patients born before "1990-01-01".',
        hint: 'Use select full_name, date_of_birth from patients where date_of_birth < "1990-01-01";',
        initialQuery: '-- patients born before 1990\nselect full_name, date_of_birth from patients\nwhere ',
        expectedQuery: "select full_name, date_of_birth from patients where date_of_birth < '1990-01-01';"
      },
      {
        id: 'hosp_beg_23',
        title: '23. Active Telemetry Hardware List',
        badge: 'WHERE STATUS FILTER',
        description: 'Select all smart hardware records where `status = "active"`.',
        hint: 'Use select * from smart_equipment where status = "active";',
        initialQuery: '-- active equipment list\nselect * from smart_equipment\nwhere status = ',
        expectedQuery: "select * from smart_equipment where status = 'active';"
      },
      {
        id: 'hosp_beg_24',
        title: '24. Total Count of Registered Doctors',
        badge: 'COUNT AGGREGATE',
        description: 'Calculate the total count of attending doctors in the `doctors` table.',
        hint: 'Use select count(*) as total_doctors from doctors;',
        initialQuery: '-- total doctors count\nselect count(*) as total_doctors from ',
        expectedQuery: 'select count(*) as total_doctors from doctors;'
      },
      {
        id: 'hosp_beg_25',
        title: '25. Floor 1 Department Units',
        badge: 'WHERE FILTER',
        description: 'Select `department_name` for departments situated on `floor_number = 1`.',
        hint: 'Use select department_name from departments where floor_number = 1;',
        initialQuery: '-- floor 1 departments\nselect department_name from departments\nwhere ',
        expectedQuery: 'select department_name from departments where floor_number = 1;'
      }
    ],
    Intermediate: [
      {
        id: 'hosp_int_1',
        title: '1. Count Doctors per Specialization',
        badge: 'COUNT() AGGREGATE',
        description: 'Count doctors grouped by `specialization`.',
        hint: 'Select specialization, count(*) as doc_count from doctors group by specialization;',
        initialQuery: '-- doctor count per specialization\nselect specialization, count(*) as doc_count\nfrom doctors\ngroup by ',
        expectedQuery: 'select specialization, count(*) as doc_count from doctors group by specialization;'
      },
      {
        id: 'hosp_int_2',
        title: '2. Count Active Admissions (Discharge Date IS NULL)',
        badge: 'IS NULL FILTER',
        description: 'Count patient admissions currently active (`discharge_date IS NULL`).',
        hint: 'Select count(*) as active_admissions from admissions where discharge_date is null;',
        initialQuery: '-- active admissions count\nselect count(*) as active_admissions\nfrom admissions\nwhere ',
        expectedQuery: 'select count(*) as active_admissions from admissions where discharge_date is null;'
      },
      {
        id: 'hosp_int_3',
        title: '3. Total Patients Admitted Per Doctor',
        badge: 'GROUP BY & COUNT',
        description: 'Select `doctor_id` and count of admissions handled per doctor.',
        hint: 'Select doctor_id, count(*) as total_admissions from admissions group by doctor_id;',
        initialQuery: '-- admissions per doctor\nselect doctor_id, count(*) as total_admissions\nfrom admissions\ngroup by ',
        expectedQuery: 'select doctor_id, count(*) as total_admissions from admissions group by doctor_id;'
      },
      {
        id: 'hosp_int_4',
        title: '4. Filter Doctors Handling Multiple Admissions',
        badge: 'HAVING CLAUSE',
        description: 'Select `doctor_id` handling 1 or more admissions using HAVING count(*) >= 1.',
        hint: 'Group by doctor_id having count(*) >= 1.',
        initialQuery: '-- doctors with admissions >= 1\nselect doctor_id, count(*) as total_admissions\nfrom admissions\ngroup by doctor_id\nhaving ',
        expectedQuery: 'select doctor_id, count(*) as total_admissions from admissions group by doctor_id having count(*) >= 1;'
      },
      {
        id: 'hosp_int_5',
        title: '5. Subquery: Doctors in Cardiology Floor 1',
        badge: 'IN SUBQUERY',
        description: 'Select all doctors whose assigned department is situated on `floor_number = 1`.',
        hint: 'Select * from doctors where department_id in (select department_id from departments where floor_number = 1);',
        initialQuery: '-- doctors on floor 1 departments\nselect * from doctors\nwhere department_id in (select department_id from departments where floor_number = 1);',
        expectedQuery: 'select * from doctors where department_id in (select department_id from departments where floor_number = 1);'
      },
      {
        id: 'hosp_int_6',
        title: '6. Subquery: Active Telemetry Patients',
        badge: 'EXISTS SUBQUERY',
        description: 'Select all patients assigned to active telemetry hardware in `smart_equipment`.',
        hint: 'Select * from patients p where exists (select 1 from smart_equipment se where se.patient_id = p.patient_id and se.status = "active");',
        initialQuery: '-- patients with active telemetry\nselect * from patients p\nwhere exists (select 1 from smart_equipment se where se.patient_id = p.patient_id and se.status = \'active\');',
        expectedQuery: "select * from patients p where exists (select 1 from smart_equipment se where se.patient_id = p.patient_id and se.status = 'active');"
      },
      {
        id: 'hosp_int_7',
        title: '7. LIKE Pattern Match Patient Phone Area Code',
        badge: 'LIKE OPERATOR',
        description: 'Select all patients whose `contact_number` starts with area code "555-01".',
        hint: 'Select * from patients where contact_number like "555-01%";',
        initialQuery: '-- patient contact 555-01%\nselect * from patients\nwhere contact_number like ',
        expectedQuery: "select * from patients where contact_number like '555-01%';"
      },
      {
        id: 'hosp_int_8',
        title: '8. BETWEEN Room Range Admission Search',
        badge: 'BETWEEN OPERATOR',
        description: 'Select all admissions assigned to room numbers between 100 and 150.',
        hint: 'Select * from admissions where room_number between 100 and 150;',
        initialQuery: '-- rooms between 100 and 150\nselect * from admissions\nwhere room_number between ',
        expectedQuery: 'select * from admissions where room_number between 100 and 150;'
      },
      {
        id: 'hosp_int_9',
        title: '9. IN Operator for Active Departments',
        badge: 'IN OPERATOR',
        description: 'Select all doctors assigned to `department_id` 1, 2, or 4.',
        hint: 'Select * from doctors where department_id in (1, 2, 4);',
        initialQuery: '-- doctors in department 1, 2, or 4\nselect * from doctors\nwhere department_id in ',
        expectedQuery: 'select * from doctors where department_id in (1, 2, 4);'
      },
      {
        id: 'hosp_int_10',
        title: '10. Patient Full Name Search',
        badge: 'LIKE OPERATOR',
        description: 'Select all patients whose `full_name` contains "smith".',
        hint: 'Select * from patients where full_name like "%smith%";',
        initialQuery: '-- patient name contains smith\nselect * from patients\nwhere full_name like ',
        expectedQuery: "select * from patients where full_name like '%smith%';"
      },
      {
        id: 'hosp_int_11',
        title: '11. Equipment Status Distribution',
        badge: 'GROUP BY & COUNT',
        description: 'Group `smart_equipment` by `status` and count total units per status.',
        hint: 'Select status, count(*) as device_count from smart_equipment group by status;',
        initialQuery: '-- equipment status count\nselect status, count(*) as device_count\nfrom smart_equipment\ngroup by ',
        expectedQuery: 'select status, count(*) as device_count from smart_equipment group by status;'
      },
      {
        id: 'hosp_int_12',
        title: '12. Unmonitored Active Equipment (PATIENT_ID IS NULL)',
        badge: 'IS NULL FILTER',
        description: 'Select all smart hardware records where `patient_id` IS NULL.',
        hint: 'Select * from smart_equipment where patient_id is null;',
        initialQuery: '-- unassigned hardware\nselect * from smart_equipment\nwhere patient_id is null;',
        expectedQuery: 'select * from smart_equipment where patient_id is null;'
      },
      {
        id: 'hosp_int_13',
        title: '13. Calibrated Telemetry Hardware Search',
        badge: 'WHERE FILTER',
        description: 'Select `equipment_type` and `last_calibration_date` for hardware calibrated in year 2023.',
        hint: 'Select equipment_type, last_calibration_date from smart_equipment where last_calibration_date like "2023%";',
        initialQuery: '-- equipment calibrated in 2023\nselect equipment_type, last_calibration_date\nfrom smart_equipment\nwhere last_calibration_date like ',
        expectedQuery: "select equipment_type, last_calibration_date from smart_equipment where last_calibration_date like '2023%';"
      },
      {
        id: 'hosp_int_14',
        title: '14. Calculate Patient Stay Days (JULIANDAY)',
        badge: 'DATE MATH',
        description: 'Calculate stay duration `julianday(discharge_date) - julianday(admission_date)` AS `stay_days` for discharged admissions.',
        hint: 'Select admission_id, (julianday(discharge_date) - julianday(admission_date)) as stay_days from admissions where discharge_date is not null;',
        initialQuery: '-- calculate stay days\nselect admission_id, (julianday(discharge_date) - julianday(admission_date)) as stay_days\nfrom admissions\nwhere discharge_date is not null;',
        expectedQuery: 'select admission_id, (julianday(discharge_date) - julianday(admission_date)) as stay_days from admissions where discharge_date is not null;'
      },
      {
        id: 'hosp_int_15',
        title: '15. Count Hardware per Department',
        badge: 'GROUP BY & COUNT',
        description: 'Select `department_id` and count of hardware deployed per department.',
        hint: 'Select department_id, count(*) as total_hardware from smart_equipment group by department_id;',
        initialQuery: '-- hardware count per department\nselect department_id, count(*) as total_hardware\nfrom smart_equipment\ngroup by ',
        expectedQuery: 'select department_id, count(*) as total_hardware from smart_equipment group by department_id;'
      },
      {
        id: 'hosp_int_16',
        title: '16. Earliest Hospital Patient Admission',
        badge: 'MIN DATE',
        description: 'Select the earliest `admission_date` from `admissions`.',
        hint: 'Select min(admission_date) as earliest_admission from admissions;',
        initialQuery: '-- earliest admission date\nselect min(admission_date) as earliest_admission\nfrom admissions;',
        expectedQuery: 'select min(admission_date) as earliest_admission from admissions;'
      },
      {
        id: 'hosp_int_17',
        title: '17. Doctors Specializing in Surgery or Neurology',
        badge: 'IN LIST OPERATOR',
        description: 'Select all doctors specializing in "surgery" or "neurology".',
        hint: 'Select * from doctors where lower(specialization) in ("surgery", "neurology");',
        initialQuery: '-- surgery or neurology doctors\nselect * from doctors\nwhere lower(specialization) in (\'surgery\', \'neurology\');',
        expectedQuery: "select * from doctors where lower(specialization) in ('surgery', 'neurology');"
      },
      {
        id: 'hosp_int_18',
        title: '18. Filter Admissions in Room 100 to 200',
        badge: 'BETWEEN RANGE',
        description: 'Count admissions assigned to room numbers between 100 and 200.',
        hint: 'Select count(*) as room_admissions from admissions where room_number between 100 and 200;',
        initialQuery: '-- admissions rooms 100 to 200\nselect count(*) as room_admissions\nfrom admissions\nwhere room_number between 100 and 200;',
        expectedQuery: 'select count(*) as room_admissions from admissions where room_number between 100 and 200;'
      },
      {
        id: 'hosp_int_19',
        title: '19. Patient Birth Year Extraction',
        badge: 'STRFTIME DATE',
        description: 'Select `full_name` and `strftime("%Y", date_of_birth)` AS `birth_year` from `patients`.',
        hint: 'Select full_name, strftime("%Y", date_of_birth) as birth_year from patients;',
        initialQuery: '-- extract birth year\nselect full_name, strftime(\'%Y\', date_of_birth) as birth_year\nfrom patients;',
        expectedQuery: "select full_name, strftime('%Y', date_of_birth) as birth_year from patients;"
      },
      {
        id: 'hosp_int_20',
        title: '20. Department Floor Count',
        badge: 'GROUP BY & COUNT',
        description: 'Group `departments` by `floor_number` and count total units per floor.',
        hint: 'Select floor_number, count(*) as dept_count from departments group by floor_number;',
        initialQuery: '-- floor department count\nselect floor_number, count(*) as dept_count\nfrom departments\ngroup by ',
        expectedQuery: 'select floor_number, count(*) as dept_count from departments group by floor_number;'
      },
      {
        id: 'hosp_int_21',
        title: '21. Doctor Count by Specialization Group',
        badge: 'GROUP BY',
        description: 'Group doctors by `specialization` and count total doctors.',
        hint: 'Use select specialization, count(*) as total_docs from doctors group by specialization;',
        initialQuery: '-- doctor count by specialization\nselect specialization, count(*) as total_docs\nfrom doctors\ngroup by ',
        expectedQuery: 'select specialization, count(*) as total_docs from doctors group by specialization;'
      },
      {
        id: 'hosp_int_22',
        title: '22. Admissions Between Rooms 100 and 150',
        badge: 'BETWEEN FILTER',
        description: 'Select all admissions in rooms between 100 and 150.',
        hint: 'Use select * from admissions where room_number between 100 and 150;',
        initialQuery: '-- admissions room 100 to 150\nselect * from admissions\nwhere room_number between ',
        expectedQuery: 'select * from admissions where room_number between 100 and 150;'
      },
      {
        id: 'hosp_int_23',
        title: '23. Discharged Admissions Count',
        badge: 'COUNT IS NOT NULL',
        description: 'Count all completed admissions where `discharge_date` is not null.',
        hint: 'Use select count(*) as discharged_count from admissions where discharge_date is not null;',
        initialQuery: '-- discharged count\nselect count(*) as discharged_count\nfrom admissions\nwhere discharge_date is not null;',
        expectedQuery: 'select count(*) as discharged_count from admissions where discharge_date is not null;'
      },
      {
        id: 'hosp_int_24',
        title: '24. Active Patient Equipment Assignments',
        badge: 'WHERE AND FILTER',
        description: 'Select smart equipment records where patient_id is not null and status = "active".',
        hint: 'Use select * from smart_equipment where patient_id is not null and status = "active";',
        initialQuery: '-- active hardware on patients\nselect * from smart_equipment\nwhere patient_id is not null and status = ',
        expectedQuery: "select * from smart_equipment where patient_id is not null and status = 'active';"
      },
      {
        id: 'hosp_int_25',
        title: '25. Departments on Floor 2 or Higher',
        badge: 'WHERE & ORDER',
        description: 'Select department_name and floor_number for floors >= 2 ordered by floor_number asc.',
        hint: 'Use select department_name, floor_number from departments where floor_number >= 2 order by floor_number asc;',
        initialQuery: '-- departments floor >= 2\nselect department_name, floor_number from departments\nwhere floor_number >= 2\norder by ',
        expectedQuery: 'select department_name, floor_number from departments where floor_number >= 2 order by floor_number asc;'
      }
    ],
    Pro: [
      {
        id: 'hosp_pro_1',
        title: '1. Relational JOIN Doctors and Departments',
        badge: 'INNER JOIN',
        description: 'Join `doctors` and `departments` to list doctor names, specialization, and department name.',
        hint: 'Join doctors and departments ON doctors.department_id = departments.department_id.',
        initialQuery: '-- doctors and departments join\nselect doc.first_name, doc.last_name, doc.specialization, dep.department_name\nfrom doctors doc\njoin departments dep on ',
        expectedQuery: 'select doc.first_name, doc.last_name, doc.specialization, dep.department_name from doctors doc join departments dep on doc.department_id = dep.department_id;'
      },
      {
        id: 'hosp_pro_2',
        title: '2. Multi-Table JOIN Active Patient Admissions',
        badge: '3-WAY JOIN',
        description: 'Join `admissions`, `patients`, and `doctors` to display `full_name`, `doctor_id`, and `room_number` for active stays.',
        hint: 'Join admissions, patients, doctors WHERE discharge_date IS NULL.',
        initialQuery: '-- active stay patient doctor room\nselect p.full_name, d.first_name as doctor_name, a.room_number\nfrom admissions a\njoin patients p on a.patient_id = p.patient_id\njoin doctors d on a.doctor_id = d.doctor_id\nwhere a.discharge_date is null;',
        expectedQuery: 'select p.full_name, d.first_name as doctor_name, a.room_number from admissions a join patients p on a.patient_id = p.patient_id join doctors d on a.doctor_id = d.doctor_id where a.discharge_date is null;'
      },
      {
        id: 'hosp_pro_3',
        title: '3. Left Join Unassigned Departments',
        badge: 'LEFT JOIN & IS NULL',
        description: 'Find departments with no assigned doctors using LEFT JOIN and WHERE doctor_id IS NULL.',
        hint: 'Select dep.department_name from departments dep left join doctors doc on dep.department_id = doc.department_id where doc.doctor_id is null;',
        initialQuery: '-- departments without doctors\nselect dep.department_name\nfrom departments dep\nleft join doctors doc on dep.department_id = doc.department_id\nwhere ',
        expectedQuery: 'select dep.department_name from departments dep left join doctors doc on dep.department_id = doc.department_id where doc.doctor_id is null;'
      },
      {
        id: 'hosp_pro_4',
        title: '4. CREATE VIEW CurrentAdmissions',
        badge: 'CREATE VIEW',
        description: 'Create a view named `CurrentAdmissions` selecting active admissions (`discharge_date IS NULL`).',
        hint: 'CREATE VIEW CurrentAdmissions AS SELECT * FROM admissions WHERE discharge_date IS NULL;',
        initialQuery: '-- create view currentadmissions\ncreate view CurrentAdmissions as\nselect * from admissions where discharge_date is null;',
        expectedQuery: 'create view CurrentAdmissions as select * from admissions where discharge_date is null;',
        verificationQuery: "select name from sqlite_master where type='view' and lower(name)='currentadmissions';"
      },
      {
        id: 'hosp_pro_5',
        title: '5. Query CurrentAdmissions View Room 101 Count',
        badge: 'QUERY VIEW',
        description: 'Count records in `CurrentAdmissions` view where `room_number = 101`.',
        hint: 'SELECT COUNT(*) AS room_count FROM CurrentAdmissions WHERE room_number = 101;',
        initialQuery: '-- count active admissions room 101\nselect count(*) as room_count from CurrentAdmissions where room_number = 101;',
        expectedQuery: 'create view if not exists CurrentAdmissions as select * from admissions where discharge_date is null; select count(*) as room_count from CurrentAdmissions where room_number = 101;'
      },
      {
        id: 'hosp_pro_6',
        title: '6. CREATE INDEX on Smart Equipment Status',
        badge: 'CREATE INDEX',
        description: 'Create an index named `idx_equipment_status` on `status` column in `smart_equipment`.',
        hint: 'CREATE INDEX idx_equipment_status ON smart_equipment(status);',
        initialQuery: '-- create index equipment status\ncreate index idx_equipment_status on smart_equipment(status);',
        expectedQuery: 'create index idx_equipment_status on smart_equipment(status);',
        verificationQuery: "select name from sqlite_master where type='index' and lower(name)='idx_equipment_status';"
      },
      {
        id: 'hosp_pro_7',
        title: '7. Create Composite Index on Admissions',
        badge: 'COMPOSITE INDEX',
        description: 'Create composite index `idx_admissions_room_date` on `room_number` and `admission_date`.',
        hint: 'CREATE INDEX idx_admissions_room_date ON admissions(room_number, admission_date);',
        initialQuery: '-- create composite index on admissions\ncreate index idx_admissions_room_date on admissions(room_number, admission_date);',
        expectedQuery: 'create index idx_admissions_room_date on admissions(room_number, admission_date);',
        verificationQuery: "select name from sqlite_master where type='index' and lower(name)='idx_admissions_room_date';"
      },
      {
        id: 'hosp_pro_8',
        title: '8. Transaction Hardware Status Batch Update',
        badge: 'TRANSACTIONS',
        description: 'Begin transaction, update equipment 10 status to "active", and commit.',
        hint: 'BEGIN TRANSACTION; UPDATE smart_equipment SET status = "active" WHERE equipment_id = 10; COMMIT;',
        initialQuery: '-- transaction hardware status update\nbegin transaction;\nupdate smart_equipment set status = \'active\' where equipment_id = 10;\ncommit;',
        expectedQuery: "begin transaction; update smart_equipment set status = 'active' where equipment_id = 10; commit;",
        verificationQuery: 'select * from smart_equipment where equipment_id = 10;'
      },
      {
        id: 'hosp_pro_9',
        title: '9. Transaction Discharge Test Update',
        badge: 'TRANSACTIONS',
        description: 'Begin transaction, update admission 301 discharge_date to "2024-03-01", and commit.',
        hint: 'BEGIN TRANSACTION; UPDATE admissions SET discharge_date = "2024-03-01" WHERE admission_id = 301; COMMIT;',
        initialQuery: '-- transaction discharge update\nbegin transaction;\nupdate admissions set discharge_date = \'2024-03-01\' where admission_id = 301;\ncommit;',
        expectedQuery: "begin transaction; update admissions set discharge_date = '2024-03-01' where admission_id = 301; commit;",
        verificationQuery: 'select * from admissions where admission_id = 301;'
      },
      {
        id: 'hosp_pro_10',
        title: '10. Safe Table Drop Smart_Equipment',
        badge: 'DROP TABLE',
        description: 'Safely drop table `temp_telemetry` if it exists.',
        hint: 'DROP TABLE IF EXISTS temp_telemetry;',
        initialQuery: '-- safe drop temp telemetry table\ndrop table if exists temp_telemetry;',
        expectedQuery: 'drop table if exists temp_telemetry;',
        verificationQuery: "select name from sqlite_master where type='table' and lower(name)='temp_telemetry';"
      },
      {
        id: 'hosp_pro_11',
        title: '11. Alter Table Add Blood Group Column',
        badge: 'ALTER TABLE',
        description: 'Add a new column `blood_type` (VARCHAR(10)) to `patients` table.',
        hint: 'ALTER TABLE patients ADD COLUMN blood_type VARCHAR(10);',
        initialQuery: '-- alter table add blood_type column\nalter table patients add column blood_type varchar(10);',
        expectedQuery: 'alter table patients add column blood_type varchar(10);',
        verificationQuery: 'select * from patients;'
      },
      {
        id: 'hosp_pro_12',
        title: '12. Truncate / Clear Admissions Records',
        badge: 'DELETE ALL',
        description: 'Clear all records from `admissions` table.',
        hint: 'DELETE FROM admissions;',
        initialQuery: '-- clear admissions records\ndelete from admissions;',
        expectedQuery: 'delete from admissions;',
        verificationQuery: 'select count(*) from admissions;'
      },
      {
        id: 'hosp_pro_13',
        title: '13. Safe Parameterized Physician Authentication',
        badge: 'SECURITY & PARAMETERS',
        description: 'Select doctor details for `doctor_id = 201`.',
        hint: 'SELECT * FROM doctors WHERE doctor_id = 201;',
        initialQuery: '-- safe parameter physician lookup\nselect * from doctors where doctor_id = 201;',
        expectedQuery: 'select * from doctors where doctor_id = 201;'
      },
      {
        id: 'hosp_pro_14',
        title: '14. UNION SQL Injection Payload Test',
        badge: 'SECURITY DEMO',
        description: 'Safely query doctor specialization for "cardiology".',
        hint: 'SELECT doctor_id, first_name FROM doctors WHERE specialization = "cardiology";',
        initialQuery: '-- safe query cardiology doctors\nselect doctor_id, first_name from doctors where specialization = \'cardiology\';',
        expectedQuery: "select doctor_id, first_name from doctors where specialization = 'cardiology';"
      },
      {
        id: 'hosp_pro_15',
        title: '15. Time Lead Difference Between Patient Visits',
        badge: 'WINDOW LEAD()',
        description: 'Use LEAD(admission_date, 1) OVER (PARTITION BY patient_id ORDER BY admission_date) on admissions.',
        hint: 'LEAD(admission_date, 1) OVER (PARTITION BY patient_id ORDER BY admission_date).',
        initialQuery: '-- lead admission date\nselect admission_id, patient_id, admission_date, lead(admission_date, 1) over (partition by patient_id order by admission_date) as next_visit\nfrom admissions;',
        expectedQuery: 'select admission_id, patient_id, admission_date, lead(admission_date, 1) over (partition by patient_id order by admission_date) as next_visit from admissions;'
      },
      {
        id: 'hosp_pro_16',
        title: '16. Rank Departments by Admitted Patient Volume',
        badge: 'WINDOW DENSE_RANK()',
        description: 'Dense rank departments based on total admissions using DENSE_RANK() OVER (ORDER BY COUNT(a.admission_id) DESC).',
        hint: 'DENSE_RANK() OVER (ORDER BY COUNT(a.admission_id) DESC).',
        initialQuery: '-- rank departments by volume\nselect doc.department_id, count(a.admission_id) as total_adm, dense_rank() over (order by count(a.admission_id) desc) as rnk\nfrom doctors doc\njoin admissions a on doc.doctor_id = a.doctor_id\ngroup by doc.department_id;',
        expectedQuery: 'select doc.department_id, count(a.admission_id) as total_adm, dense_rank() over (order by count(a.admission_id) desc) as rnk from doctors doc join admissions a on doc.doctor_id = a.doctor_id group by doc.department_id;'
      },
      {
        id: 'hosp_pro_17',
        title: '17. CTE Floor 1 Departments & Staff',
        badge: 'CTE (WITH)',
        description: 'Write a CTE `floor1_deps` selecting department_id from `departments` on floor_number = 1.',
        hint: 'WITH floor1_deps AS (SELECT department_id FROM departments WHERE floor_number = 1) SELECT * FROM doctors WHERE department_id IN (SELECT department_id FROM floor1_deps);',
        initialQuery: '-- cte floor 1 doctors\nwith floor1_deps as (\n  select department_id from departments where floor_number = 1\n)\nselect * from doctors where department_id in (select department_id from floor1_deps);',
        expectedQuery: 'with floor1_deps as (select department_id from departments where floor_number = 1) select * from doctors where department_id in (select department_id from floor1_deps);'
      },
      {
        id: 'hosp_pro_18',
        title: '18. Head Doctor Organizational Hierarchy',
        badge: 'JOIN & CTE',
        description: 'Join `departments` and `doctors` on `head_doctor_id = doctor_id` to list unit heads.',
        hint: 'SELECT dep.department_name, doc.first_name, doc.last_name FROM departments dep JOIN doctors doc ON dep.head_doctor_id = doc.doctor_id;',
        initialQuery: '-- head doctors unit query\nselect dep.department_name, doc.first_name, doc.last_name\nfrom departments dep\njoin doctors doc on dep.head_doctor_id = doc.doctor_id;',
        expectedQuery: 'select dep.department_name, doc.first_name, doc.last_name from departments dep join doctors doc on dep.head_doctor_id = doc.doctor_id;'
      },
      {
        id: 'hosp_pro_19',
        title: '19. Patient Active Hardware Telemetry',
        badge: '3-WAY JOIN',
        description: 'Join `patients`, `smart_equipment`, and `departments` where status = "active".',
        hint: 'Join patients, smart_equipment, departments WHERE status = "active".',
        initialQuery: '-- patient active hardware join\nselect p.full_name, se.equipment_type, d.department_name\nfrom patients p\njoin smart_equipment se on p.patient_id = se.patient_id\njoin departments d on se.department_id = d.department_id\nwhere se.status = \'active\';',
        expectedQuery: "select p.full_name, se.equipment_type, d.department_name from patients p join smart_equipment se on p.patient_id = se.patient_id join departments d on se.department_id = d.department_id where se.status = 'active';"
      },
      {
        id: 'hosp_pro_20',
        title: '20. Department Unique Patient Volume',
        badge: 'COUNT(DISTINCT)',
        description: 'Select department_id and count(distinct patient_id) from doctors and admissions.',
        hint: 'Select doc.department_id, count(distinct a.patient_id) as unique_patients from doctors doc join admissions a on doc.doctor_id = a.doctor_id group by doc.department_id;',
        initialQuery: '-- department unique patient volume\nselect doc.department_id, count(distinct a.patient_id) as unique_patients\nfrom doctors doc\njoin admissions a on doc.doctor_id = a.doctor_id\ngroup by doc.department_id;',
        expectedQuery: 'select doc.department_id, count(distinct a.patient_id) as unique_patients from doctors doc join admissions a on doc.doctor_id = a.doctor_id group by doc.department_id;'
      },
      {
        id: 'hosp_pro_21',
        title: '21. Clean Orphan Admissions Delete',
        badge: 'DELETE SUBQUERY',
        description: 'Delete from `admissions` where `patient_id` not in (select patient_id from patients).',
        hint: 'Delete from admissions where patient_id not in (select patient_id from patients);',
        initialQuery: '-- delete orphan admissions\ndelete from admissions where patient_id not in (select patient_id from patients);',
        expectedQuery: 'delete from admissions where patient_id not in (select patient_id from patients);',
        verificationQuery: 'select count(*) from admissions;'
      },
      {
        id: 'hosp_pro_22',
        title: '22. Self Join Doctors Same Specialization',
        badge: 'SELF JOIN',
        description: 'Self-join `doctors` to find pairs of physicians in the same department.',
        hint: 'JOIN doctors d2 ON d1.department_id = d2.department_id AND d1.doctor_id < d2.doctor_id.',
        initialQuery: '-- self join same department doctors\nselect d1.first_name as doc1, d2.first_name as doc2, d1.department_id\nfrom doctors d1\njoin doctors d2 on d1.department_id = d2.department_id and d1.doctor_id < d2.doctor_id;',
        expectedQuery: 'select d1.first_name as doc1, d2.first_name as doc2, d1.department_id from doctors d1 join doctors d2 on d1.department_id = d2.department_id and d1.doctor_id < d2.doctor_id;'
      },
      {
        id: 'hosp_pro_23',
        title: '23. Batch Discharge Patients in Room 200',
        badge: 'UPDATE BATCH',
        description: 'Update `admissions` setting discharge_date = "2024-01-01" where room_number > 200.',
        hint: 'UPDATE admissions SET discharge_date = "2024-01-01" WHERE room_number > 200;',
        initialQuery: '-- batch discharge room > 200\nupdate admissions set discharge_date = \'2024-01-01\' where room_number > 200;',
        expectedQuery: "update admissions set discharge_date = '2024-01-01' where room_number > 200;",
        verificationQuery: 'select * from admissions where room_number > 200;'
      },
      {
        id: 'hosp_pro_24',
        title: '24. DROP VIEW CurrentAdmissions',
        badge: 'DROP VIEW',
        description: 'Safely drop view `CurrentAdmissions` if it exists.',
        hint: 'DROP VIEW IF EXISTS CurrentAdmissions;',
        initialQuery: '-- drop view currentadmissions\ndrop view if exists CurrentAdmissions;',
        expectedQuery: 'drop view if exists CurrentAdmissions;',
        verificationQuery: "select name from sqlite_master where type='view' and lower(name)='currentadmissions';"
      },
      {
        id: 'hosp_pro_25',
        title: '25. DROP INDEX idx_equipment_status',
        badge: 'DROP INDEX',
        description: 'Safely drop index `idx_equipment_status` if it exists.',
        hint: 'DROP INDEX IF EXISTS idx_equipment_status;',
        initialQuery: '-- drop index equipment status\ndrop index if exists idx_equipment_status;',
        expectedQuery: 'drop index if exists idx_equipment_status;',
        verificationQuery: "select name from sqlite_master where type='index' and lower(name)='idx_equipment_status';"
      },
      {
        id: 'hosp_pro_26',
        title: '26. Dense Rank Doctors by Department',
        badge: 'WINDOW DENSE_RANK()',
        description: 'Dense rank doctors ordered by doctor_id within each department.',
        hint: 'Use select doctor_id, first_name, department_id, dense_rank() over (partition by department_id order by doctor_id) as rnk from doctors;',
        initialQuery: '-- dense rank doctors by department\nselect doctor_id, first_name, department_id, dense_rank() over (partition by department_id order by doctor_id) as rnk\nfrom doctors;',
        expectedQuery: 'select doctor_id, first_name, department_id, dense_rank() over (partition by department_id order by doctor_id) as rnk from doctors;'
      },
      {
        id: 'hosp_pro_27',
        title: '27. CTE Active Patients in Telemetry',
        badge: 'CTE (WITH)',
        description: 'Write a CTE `active_devices` selecting patient_id and equipment_type from smart_equipment where status = "active".',
        hint: 'Use with active_devices as (select patient_id, equipment_type from smart_equipment where status = "active") select * from active_devices;',
        initialQuery: '-- cte active telemetry devices\nwith active_devices as (\n  select patient_id, equipment_type from smart_equipment where status = \'active\'\n)\nselect * from active_devices;',
        expectedQuery: "with active_devices as (select patient_id, equipment_type from smart_equipment where status = 'active') select * from active_devices;"
      },
      {
        id: 'hosp_pro_28',
        title: '28. Subquery Patients Admitted to Room > 105',
        badge: 'IN SUBQUERY',
        description: 'Select full_name from patients where patient_id in (select patient_id from admissions where room_number > 105).',
        hint: 'Use select full_name from patients where patient_id in (select patient_id from admissions where room_number > 105);',
        initialQuery: '-- patients admitted room > 105\nselect full_name from patients\nwhere patient_id in (select patient_id from admissions where room_number > 105);',
        expectedQuery: 'select full_name from patients where patient_id in (select patient_id from admissions where room_number > 105);'
      },
      {
        id: 'hosp_pro_29',
        title: '29. Lag Admission Date Tracker',
        badge: 'WINDOW LAG()',
        description: 'Use LAG(admission_date, 1) OVER (PARTITION BY patient_id ORDER BY admission_date) on admissions.',
        hint: 'Use select admission_id, patient_id, admission_date, lag(admission_date, 1) over (partition by patient_id order by admission_date) as prev_admission from admissions;',
        initialQuery: '-- lag admission date tracker\nselect admission_id, patient_id, admission_date, lag(admission_date, 1) over (partition by patient_id order by admission_date) as prev_admission\nfrom admissions;',
        expectedQuery: 'select admission_id, patient_id, admission_date, lag(admission_date, 1) over (partition by patient_id order by admission_date) as prev_admission from admissions;'
      },
      {
        id: 'hosp_pro_30',
        title: '30. Safe Table Drop Temp Admissions',
        badge: 'DROP TABLE',
        description: 'Safely drop table `temp_admissions` if it exists.',
        hint: 'DROP TABLE IF EXISTS temp_admissions;',
        initialQuery: '-- safe drop temp admissions\ndrop table if exists temp_admissions;',
        expectedQuery: 'drop table if exists temp_admissions;',
        verificationQuery: "select name from sqlite_master where type='table' and lower(name)='temp_admissions';"
      }
    ]
  }
};
