// Schema SQL scripts and metadata for Employee Database and Hospital Database
// Each table contains 5 default rows of seed data in lowercase format.

// ==========================================
// 1. EMPLOYEE DATABASE SCHEMA & DUMMY DATA
// ==========================================
export const EMPLOYEE_INITIAL_SQL = `
DROP TABLE IF EXISTS employee_projects;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS salaries;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS departments;

-- 1. Departments Table (5 rows)
CREATE TABLE departments (
    department_id INTEGER PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL
);

INSERT INTO departments (department_id, department_name, location) VALUES
(1, 'engineering', 'building a'),
(2, 'human resources', 'building b'),
(3, 'sales & marketing', 'building c'),
(4, 'finance & it', 'building d'),
(5, 'operations & logistics', 'building e');

-- 2. Employees Table (5 rows)
CREATE TABLE employees (
    employee_id INTEGER PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hire_date DATE NOT NULL,
    department_id INTEGER,
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
);

INSERT INTO employees (employee_id, first_name, last_name, email, hire_date, department_id) VALUES
(1, 'alice', 'walker', 'alice.walker@company.com', '2022-03-15', 1),
(2, 'bob', 'miller', 'bob.miller@company.com', '2023-01-10', 1),
(3, 'charlie', 'davis', 'charlie.davis@company.com', '2023-06-01', 2),
(4, 'diana', 'prince', 'diana.prince@company.com', '2021-11-20', 3),
(5, 'edward', 'norton', 'edward.norton@company.com', '2024-02-01', 4);

-- 3. Salaries Table (5 rows)
CREATE TABLE salaries (
    salary_id INTEGER PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    effective_date DATE NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);

INSERT INTO salaries (salary_id, employee_id, amount, effective_date) VALUES
(101, 1, 85000.0, '2022-03-15'),
(102, 2, 72000.0, '2023-01-10'),
(103, 3, 60000.0, '2023-06-01'),
(104, 4, 95000.0, '2021-11-20'),
(105, 5, 68000.0, '2024-02-01');

-- 4. Projects Table (5 rows)
CREATE TABLE projects (
    project_id INTEGER PRIMARY KEY,
    project_name VARCHAR(100) NOT NULL,
    budget DECIMAL(12,2) NOT NULL,
    deadline DATE NOT NULL
);

INSERT INTO projects (project_id, project_name, budget, deadline) VALUES
(1, 'project alpha', 120000.0, '2024-12-31'),
(2, 'hr automation', 45000.0, '2024-09-30'),
(3, 'global sales push', 80000.0, '2025-03-15'),
(4, 'it infrastructure upgrade', 35000.0, '2024-06-30'),
(5, 'cloud platform sync', 150000.0, '2024-11-15');

-- 5. Employee_Projects Junction Table (5 rows)
CREATE TABLE employee_projects (
    employee_id INTEGER NOT NULL,
    project_id INTEGER NOT NULL,
    hours_allocated INTEGER NOT NULL,
    PRIMARY KEY (employee_id, project_id),
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
    FOREIGN KEY (project_id) REFERENCES projects(project_id)
);

INSERT INTO employee_projects (employee_id, project_id, hours_allocated) VALUES
(1, 1, 35),
(2, 2, 10),
(2, 1, 40),
(3, 2, 25),
(4, 3, 30);
`;

export const EMPLOYEE_SCHEMA_INFO = [
  {
    tableName: 'departments',
    description: 'Corporate organizational divisions and office locations (5 default rows).',
    columns: [
      { name: 'department_id', type: 'INT', key: 'PK', desc: 'Unique Department ID' },
      { name: 'department_name', type: 'VARCHAR(100)', key: '', desc: 'Division Name' },
      { name: 'location', type: 'VARCHAR(100)', key: '', desc: 'Facility Location' }
    ]
  },
  {
    tableName: 'employees',
    description: 'Staff directory, emails, and assigned departments (5 default rows).',
    columns: [
      { name: 'employee_id', type: 'INT', key: 'PK', desc: 'Employee ID Number' },
      { name: 'first_name', type: 'VARCHAR(50)', key: '', desc: 'First Name' },
      { name: 'last_name', type: 'VARCHAR(50)', key: '', desc: 'Last Name' },
      { name: 'email', type: 'VARCHAR(100)', key: '', desc: 'Corporate Email' },
      { name: 'hire_date', type: 'DATE', key: '', desc: 'Date Hired (YYYY-MM-DD)' },
      { name: 'department_id', type: 'INT', key: 'FK', desc: 'Department ID' }
    ]
  },
  {
    tableName: 'salaries',
    description: 'Compensation records and effective promotion dates (5 default rows).',
    columns: [
      { name: 'salary_id', type: 'INT', key: 'PK', desc: 'Salary Log ID' },
      { name: 'employee_id', type: 'INT', key: 'FK', desc: 'Linked Employee' },
      { name: 'amount', type: 'DECIMAL(10,2)', key: '', desc: 'Annual Compensation ($)' },
      { name: 'effective_date', type: 'DATE', key: '', desc: 'Effective Date (YYYY-MM-DD)' }
    ]
  },
  {
    tableName: 'projects',
    description: 'Active corporate projects, budgets, and deadlines (5 default rows).',
    columns: [
      { name: 'project_id', type: 'INT', key: 'PK', desc: 'Project Serial ID' },
      { name: 'project_name', type: 'VARCHAR(100)', key: '', desc: 'Project Title' },
      { name: 'budget', type: 'DECIMAL(12,2)', key: '', desc: 'Budget Allocation ($)' },
      { name: 'deadline', type: 'DATE', key: '', desc: 'Target Completion Date (YYYY-MM-DD)' }
    ]
  },
  {
    tableName: 'employee_projects',
    description: 'Project assignment allocations and weekly hour logs (5 default rows).',
    columns: [
      { name: 'employee_id', type: 'INT', key: 'PK/FK', desc: 'Assigned Employee' },
      { name: 'project_id', type: 'INT', key: 'PK/FK', desc: 'Assigned Project' },
      { name: 'hours_allocated', type: 'INT', key: '', desc: 'Weekly Hours Allocated' }
    ]
  }
];


// ==========================================
// 2. HOSPITAL DATABASE SCHEMA & DUMMY DATA
// ==========================================
export const HOSPITAL_INITIAL_SQL = `
DROP TABLE IF EXISTS smart_equipment;
DROP TABLE IF EXISTS admissions;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS departments;

-- 1. Departments Table (5 rows)
CREATE TABLE departments (
    department_id INTEGER PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL,
    floor_number INTEGER NOT NULL,
    head_doctor_id INTEGER
);

INSERT INTO departments (department_id, department_name, floor_number, head_doctor_id) VALUES
(1, 'cardiology', 1, 201),
(2, 'diagnostics & radiology', 2, 202),
(3, 'surgery', 3, 203),
(4, 'neurology & icu', 2, 204),
(5, 'pediatrics & emergency', 1, 205);

-- 2. Doctors Table (5 rows)
CREATE TABLE doctors (
    doctor_id INTEGER PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    department_id INTEGER,
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
);

INSERT INTO doctors (doctor_id, first_name, last_name, specialization, department_id) VALUES
(201, 'sarah', 'jenkins', 'cardiology', 1),
(202, 'gregory', 'house', 'diagnostics', 2),
(203, 'meredith', 'grey', 'surgery', 3),
(204, 'julian', 'subramaniam', 'neurology', 4),
(205, 'john', 'watson', 'pediatrics', 5);

-- 3. Patients Table (5 rows)
CREATE TABLE patients (
    patient_id INTEGER PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    emergency_contact VARCHAR(20) NOT NULL
);

INSERT INTO patients (patient_id, full_name, date_of_birth, contact_number, emergency_contact) VALUES
(1, 'robert chen', '1974-05-12', '555-0101', '555-9901'),
(2, 'elena rostova', '1989-11-23', '555-0102', '555-9902'),
(3, 'marcus vance', '1962-03-30', '555-0103', '555-9903'),
(4, 'sophia smith', '1995-08-14', '555-0104', '555-9904'),
(5, 'david kim', '2003-01-05', '555-0105', '555-9905');

-- 4. Admissions Table (5 rows)
CREATE TABLE admissions (
    admission_id INTEGER PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    room_number INTEGER NOT NULL,
    admission_date DATE NOT NULL,
    discharge_date DATE,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id)
);

INSERT INTO admissions (admission_id, patient_id, doctor_id, room_number, admission_date, discharge_date) VALUES
(301, 1, 201, 101, '2023-07-10', '2023-07-18'),
(302, 2, 203, 150, '2023-08-01', NULL),
(303, 3, 202, 102, '2023-09-15', '2023-09-22'),
(304, 4, 204, 201, '2023-10-05', NULL),
(305, 5, 205, 105, '2023-11-20', NULL);

-- 5. Smart Equipment Table (5 rows)
CREATE TABLE smart_equipment (
    equipment_id INTEGER PRIMARY KEY,
    equipment_type VARCHAR(100) NOT NULL,
    status VARCHAR(20) CHECK(status IN ('active', 'maintenance', 'inactive')),
    department_id INTEGER NOT NULL,
    patient_id INTEGER,
    last_calibration_date DATE NOT NULL,
    FOREIGN KEY (department_id) REFERENCES departments(department_id),
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
);

INSERT INTO smart_equipment (equipment_id, equipment_type, status, department_id, patient_id, last_calibration_date) VALUES
(10, 'heart rate monitor', 'active', 1, 1, '2023-05-10'),
(20, 'smart infusion pump', 'maintenance', 1, NULL, '2022-11-15'),
(30, 'ai mri scanner', 'active', 2, NULL, '2023-08-01'),
(40, 'robotic tele-arm', 'active', 3, 2, '2023-06-20'),
(50, 'eeg brainwave hub', 'maintenance', 4, 4, '2022-09-01');
`;

export const HOSPITAL_SCHEMA_INFO = [
  {
    tableName: 'departments',
    description: 'Medical divisions, floor locations, and department heads (5 default rows).',
    columns: [
      { name: 'department_id', type: 'INT', key: 'PK', desc: 'Department ID' },
      { name: 'department_name', type: 'VARCHAR(100)', key: '', desc: 'Unit Name' },
      { name: 'floor_number', type: 'INT', key: '', desc: 'Building Floor' },
      { name: 'head_doctor_id', type: 'INT', key: 'FK', desc: 'Head Physician' }
    ]
  },
  {
    tableName: 'doctors',
    description: 'Attending physicians, specializations, and assigned units (5 default rows).',
    columns: [
      { name: 'doctor_id', type: 'INT', key: 'PK', desc: 'Doctor ID' },
      { name: 'first_name', type: 'VARCHAR(50)', key: '', desc: 'Given Name' },
      { name: 'last_name', type: 'VARCHAR(50)', key: '', desc: 'Family Name' },
      { name: 'specialization', type: 'VARCHAR(100)', key: '', desc: 'Medical Field' },
      { name: 'department_id', type: 'INT', key: 'FK', desc: 'Department ID' }
    ]
  },
  {
    tableName: 'patients',
    description: 'Registered hospital patient health profiles and contacts (5 default rows).',
    columns: [
      { name: 'patient_id', type: 'INT', key: 'PK', desc: 'Patient Record ID' },
      { name: 'full_name', type: 'VARCHAR(100)', key: '', desc: 'Patient Full Name' },
      { name: 'date_of_birth', type: 'DATE', key: '', desc: 'Date of Birth (YYYY-MM-DD)' },
      { name: 'contact_number', type: 'VARCHAR(20)', key: '', desc: 'Phone Contact' },
      { name: 'emergency_contact', type: 'VARCHAR(20)', key: '', desc: 'Emergency Contact' }
    ]
  },
  {
    tableName: 'admissions',
    description: 'Patient hospital stay logs, room assignments, and discharge dates (5 default rows).',
    columns: [
      { name: 'admission_id', type: 'INT', key: 'PK', desc: 'Admission Log ID' },
      { name: 'patient_id', type: 'INT', key: 'FK', desc: 'Patient ID' },
      { name: 'doctor_id', type: 'INT', key: 'FK', desc: 'Attending Doctor ID' },
      { name: 'room_number', type: 'INT', key: '', desc: 'Assigned Hospital Room' },
      { name: 'admission_date', type: 'DATE', key: '', desc: 'Admission Date (YYYY-MM-DD)' },
      { name: 'discharge_date', type: 'DATE', key: '', desc: 'Discharge Date (NULL if active)' }
    ]
  },
  {
    tableName: 'smart_equipment',
    description: 'IoMT connected telemetry devices, calibration, and status (5 default rows).',
    columns: [
      { name: 'equipment_id', type: 'INT', key: 'PK', desc: 'IoMT Hardware ID' },
      { name: 'equipment_type', type: 'VARCHAR(100)', key: '', desc: 'Device Model Type' },
      { name: 'status', type: 'VARCHAR(20)', key: '', desc: "'active', 'maintenance', 'inactive'" },
      { name: 'department_id', type: 'INT', key: 'FK', desc: 'Department ID' },
      { name: 'patient_id', type: 'INT', key: 'FK', desc: 'Monitored Patient ID' },
      { name: 'last_calibration_date', type: 'DATE', key: '', desc: 'Last Calibration Date (YYYY-MM-DD)' }
    ]
  }
];

// ==========================================
// 3. ADVANCED INTERVIEW DATABASE SCHEMA & SEED DATA
// ==========================================
export const INTERVIEW_INITIAL_SQL = `
DROP TABLE IF EXISTS salary_history;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS logins;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS employee_projects;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS departments;

-- 1. departments
CREATE TABLE departments (
    department_id INTEGER PRIMARY KEY,
    department_name TEXT NOT NULL
);

INSERT INTO departments (department_id, department_name) VALUES
(1, 'Engineering'),
(2, 'Product Design'),
(3, 'Sales & Marketing'),
(4, 'Human Resources'),
(5, 'Executive Suite'),
(6, 'Research & Development');

-- 2. employees
CREATE TABLE employees (
    employee_id INTEGER PRIMARY KEY,
    employee_name TEXT NOT NULL,
    department_id INTEGER,
    manager_id INTEGER,
    salary NUMERIC NOT NULL,
    hire_date DATE NOT NULL,
    email TEXT,
    employment_status TEXT NOT NULL DEFAULT 'active',
    FOREIGN KEY (department_id) REFERENCES departments(department_id),
    FOREIGN KEY (manager_id) REFERENCES employees(employee_id)
);

INSERT INTO employees (employee_id, employee_name, department_id, manager_id, salary, hire_date, email, employment_status) VALUES
(1, 'Alice Walker', 1, NULL, 160000, '2020-01-15', 'alice.walker@company.com', 'active'),
(2, 'Bob Miller', 1, 1, 140000, '2021-03-10', 'bob.miller@company.com', 'active'),
(3, 'Charlie Davis', 1, 2, 115000, '2022-06-01', 'charlie.davis@company.com', 'active'),
(4, 'David Evans', 1, 2, 145000, '2019-11-20', 'david.evans@company.com', 'active'),
(5, 'Eva Green', 1, 1, 115000, '2023-02-15', 'eva.green@company.com', 'active'),
(6, 'Frank Wright', 2, 1, 130000, '2021-05-12', 'frank.wright@company.com', 'active'),
(7, 'Grace Hopper', 2, 6, 120000, '2022-08-20', 'grace.hopper@company.com', 'active'),
(8, 'Hannah Abbott', 2, 6, 95000, '2023-04-10', 'hannah.abbott@company.com', 'active'),
(9, 'Ian Malcolm', 3, 1, 125000, '2021-09-01', 'ian.malcolm@company.com', 'active'),
(10, 'Julia Roberts', 3, 9, 105000, '2022-10-15', 'julia.roberts@company.com', 'active'),
(11, 'Kevin Bacon', 3, 9, 85000, '2023-11-01', 'kevin.bacon@company.com', 'active'),
(12, 'Laura Croft', 4, 1, 110000, '2022-01-10', 'laura.croft@company.com', 'active'),
(13, 'Michael Scott', 4, 12, 75000, '2023-07-01', 'michael.scott@company.com', 'active'),
(14, 'Nina Simone', 5, 1, 150000, '2020-04-01', 'nina.simone@company.com', 'active'),
(15, 'Oscar Wilde', 4, 12, 70000, '2024-01-01', 'oscar.wilde@company.com', 'active');

-- 3. projects
CREATE TABLE projects (
    project_id INTEGER PRIMARY KEY,
    project_name TEXT NOT NULL,
    department_id INTEGER,
    start_date DATE NOT NULL,
    end_date DATE,
    budget NUMERIC NOT NULL,
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
);

INSERT INTO projects (project_id, project_name, department_id, start_date, end_date, budget) VALUES
(1, 'Apollo Cloud Platform', 1, '2024-01-01', '2024-12-31', 250000),
(2, 'Nova AI Engine', 1, '2024-02-01', NULL, 180000),
(3, 'Design System Refresh', 2, '2024-03-01', '2024-09-30', 90000),
(4, 'Global Inbound Marketing', 3, '2024-01-15', '2024-06-30', 120000),
(5, 'HR Portal Migration', 4, '2024-04-01', '2024-11-30', 60000),
(6, 'Zero Hour Initiative', 5, '2024-05-01', NULL, 50000),
(7, 'Executive Briefing Room', 5, '2024-01-01', NULL, 40000);

-- 4. employee_projects
CREATE TABLE employee_projects (
    employee_id INTEGER NOT NULL,
    project_id INTEGER NOT NULL,
    assigned_date DATE NOT NULL,
    hours_worked NUMERIC NOT NULL DEFAULT 0,
    PRIMARY KEY (employee_id, project_id),
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
    FOREIGN KEY (project_id) REFERENCES projects(project_id)
);

INSERT INTO employee_projects (employee_id, project_id, assigned_date, hours_worked) VALUES
(1, 1, '2024-01-05', 40),
(2, 1, '2024-01-10', 80),
(3, 1, '2024-01-15', 120),
(4, 1, '2024-01-20', 100),
(5, 1, '2024-01-25', 90),
(2, 2, '2024-02-05', 60),
(3, 2, '2024-02-10', 70),
(4, 2, '2024-02-15', 50),
(2, 3, '2024-03-05', 30),
(3, 3, '2024-03-10', 40),
(6, 3, '2024-03-15', 85),
(7, 3, '2024-03-20', 75),
(8, 3, '2024-03-25', 65),
(9, 4, '2024-01-20', 95),
(10, 4, '2024-02-01', 80),
(11, 4, '2024-02-10', 60),
(12, 5, '2024-04-05', 50),
(13, 5, '2024-04-10', 45),
(14, 7, '2024-01-10', 30);

-- 5. customers
CREATE TABLE customers (
    customer_id INTEGER PRIMARY KEY,
    customer_name TEXT NOT NULL,
    email TEXT,
    signup_date DATE NOT NULL,
    country TEXT NOT NULL
);

INSERT INTO customers (customer_id, customer_name, email, signup_date, country) VALUES
(1, 'Acme Corporation', 'contact@acme.com', '2024-11-01', 'USA'),
(2, 'Beta Global Tech', 'hello@beta.com', '2024-11-15', 'USA'),
(3, 'Cyberdyne Systems', 'info@cyberdyne.com', '2024-12-01', 'UK'),
(4, 'Delta Laboratories', 'support@delta.com', '2025-01-05', 'Germany'),
(5, 'Echo Logistics', 'echo@echo.com', '2025-01-10', 'Japan'),
(6, 'Foxtrot Media', 'media@foxtrot.com', '2025-02-01', 'Canada'),
(7, 'Gotham Security', 'wayne@wayne.com', '2025-02-15', 'USA'),
(8, 'Horizon Ventures', 'contact@acme.com', '2025-03-01', 'USA'),
(9, 'Inactive Inquiries', 'inactive@client.com', '2025-03-10', 'France');

-- 6. products
CREATE TABLE products (
    product_id INTEGER PRIMARY KEY,
    product_name TEXT NOT NULL,
    category TEXT NOT NULL,
    list_price NUMERIC NOT NULL,
    active BOOLEAN NOT NULL DEFAULT 1
);

INSERT INTO products (product_id, product_name, category, list_price, active) VALUES
(1, 'Cloud Enterprise Suite', 'Software', 499.00, 1),
(2, 'Smart Gateway Controller', 'Hardware', 250.00, 1),
(3, 'Industrial IoT Beacon', 'Hardware', 450.00, 1),
(4, 'Telemetry Sensor Array', 'Hardware', 750.00, 1),
(5, 'Consulting Expert Pass', 'Services', 150.00, 1),
(6, '24/7 Priority SLA', 'Services', 300.00, 1),
(7, 'Legacy Serial Cable', 'Hardware', 45.00, 0),
(8, 'Unordered Quantum Dongle', 'Hardware', 1200.00, 1);

-- 7. orders
CREATE TABLE orders (
    order_id INTEGER PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    order_date DATE NOT NULL,
    status TEXT NOT NULL,
    total_amount NUMERIC NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

INSERT INTO orders (order_id, customer_id, order_date, status, total_amount) VALUES
(1, 1, '2025-01-10', 'completed', 499.00),
(2, 1, '2025-02-12', 'completed', 750.00),
(3, 1, '2025-05-15', 'completed', 300.00),
(4, 1, '2025-08-20', 'completed', 450.00),
(5, 1, '2025-11-10', 'completed', 600.00),
(6, 2, '2025-01-15', 'completed', 1200.00),
(7, 2, '2025-02-02', 'completed', 900.00),
(8, 3, '2025-02-20', 'completed', 2800.00),
(9, 4, '2025-03-05', 'completed', 350.00),
(10, 5, '2025-03-15', 'completed', 420.00),
(11, 6, '2025-01-20', 'cancelled', 150.00),
(12, 6, '2025-02-10', 'pending', 200.00),
(13, 6, '2025-03-01', 'completed', 250.00),
(14, 7, '2025-04-01', 'completed', 800.00),
(15, 7, '2025-04-15', 'completed', 850.00),
(16, 8, '2025-05-01', 'completed', 500.00),
(17, 9, '2025-05-10', 'cancelled', 100.00),
(18, 1, '2025-06-01', 'completed', 120.00);

-- 8. order_items
CREATE TABLE order_items (
    order_item_id INTEGER PRIMARY KEY,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC NOT NULL,
    discount_pct NUMERIC NOT NULL DEFAULT 0,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

INSERT INTO order_items (order_item_id, order_id, product_id, quantity, unit_price, discount_pct) VALUES
(1, 1, 1, 1, 499.00, 0),
(2, 2, 4, 1, 750.00, 0),
(3, 3, 6, 1, 300.00, 0),
(4, 4, 3, 1, 450.00, 0),
(5, 5, 6, 2, 300.00, 0),
(6, 6, 2, 4, 250.00, 0),
(7, 6, 5, 2, 100.00, 0),
(8, 7, 3, 2, 450.00, 0),
(9, 8, 4, 3, 750.00, 0),
(10, 8, 6, 2, 300.00, 8.333),
(11, 9, 5, 2, 175.00, 0),
(12, 10, 5, 2, 210.00, 0),
(13, 13, 2, 1, 250.00, 0),
(14, 14, 3, 2, 400.00, 0),
(15, 15, 3, 1, 400.00, 0),
(16, 16, 1, 1, 500.00, 0);

-- 9. payments
CREATE TABLE payments (
    payment_id INTEGER PRIMARY KEY,
    order_id INTEGER NOT NULL,
    payment_date DATE NOT NULL,
    amount NUMERIC NOT NULL,
    payment_status TEXT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

INSERT INTO payments (payment_id, order_id, payment_date, amount, payment_status) VALUES
(1, 1, '2025-01-10', 499.00, 'successful'),
(2, 2, '2025-02-12', 750.00, 'successful'),
(3, 3, '2025-05-15', 300.00, 'successful'),
(4, 4, '2025-08-20', 450.00, 'successful'),
(5, 5, '2025-11-10', 600.00, 'successful'),
(6, 6, '2025-01-15', 1200.00, 'successful'),
(7, 7, '2025-02-02', 900.00, 'successful'),
(8, 8, '2025-02-20', 2800.00, 'successful'),
(9, 9, '2025-03-05', 350.00, 'successful'),
(10, 10, '2025-03-15', 420.00, 'successful'),
(11, 13, '2025-03-01', 250.00, 'successful'),
(12, 14, '2025-04-01', 800.00, 'successful'),
(13, 15, '2025-04-15', 850.00, 'successful'),
(14, 16, '2025-05-01', 300.00, 'successful'),
(15, 18, '2025-06-01', 120.00, 'successful');

-- 10. logins
CREATE TABLE logins (
    login_id INTEGER PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    login_date DATE NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

INSERT INTO logins (login_id, customer_id, login_date) VALUES
(1, 1, '2025-01-01'),
(2, 1, '2025-01-02'),
(3, 1, '2025-01-03'),
(4, 1, '2025-01-04'),
(5, 1, '2025-01-08'),
(6, 1, '2025-01-09'),
(7, 2, '2025-01-01'),
(8, 2, '2025-01-02'),
(9, 2, '2025-01-05'),
(10, 3, '2025-02-01'),
(11, 3, '2025-02-02'),
(12, 3, '2025-02-03');

-- 11. events
CREATE TABLE events (
    event_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    event_time TIMESTAMP NOT NULL,
    event_type TEXT NOT NULL,
    session_id TEXT NOT NULL
);

INSERT INTO events (event_id, user_id, event_time, event_type, session_id) VALUES
(1, 101, '2025-01-10 10:00:00', 'view', 's1'),
(2, 101, '2025-01-10 10:05:00', 'cart', 's1'),
(3, 101, '2025-01-10 10:12:00', 'purchase', 's1'),
(4, 102, '2025-01-10 11:00:00', 'view', 's2'),
(5, 102, '2025-01-10 11:08:00', 'cart', 's2'),
(6, 102, '2025-01-10 11:45:00', 'view', 's3'),
(7, 103, '2025-01-10 12:00:00', 'view', 's4'),
(8, 103, '2025-01-10 12:02:00', 'view', 's4');

-- 12. salary_history
CREATE TABLE salary_history (
    history_id INTEGER PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    effective_date DATE NOT NULL,
    salary NUMERIC NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);

INSERT INTO salary_history (history_id, employee_id, effective_date, salary) VALUES
(1, 1, '2020-01-15', 140000),
(2, 1, '2022-01-01', 160000),
(3, 2, '2021-03-10', 120000),
(4, 2, '2023-01-01', 140000),
(5, 3, '2022-06-01', 120000),
(6, 3, '2023-06-01', 115000),
(7, 4, '2019-11-20', 130000),
(8, 4, '2022-01-01', 145000);
`;

export const INTERVIEW_SCHEMA_INFO = [
  {
    tableName: 'departments',
    description: 'Corporate business divisions and departments.',
    columns: [
      { name: 'department_id', type: 'INT', key: 'PK', desc: 'Unique Department ID' },
      { name: 'department_name', type: 'VARCHAR(100)', key: '', desc: 'Department Name' }
    ]
  },
  {
    tableName: 'employees',
    description: 'Company workforce directory with reporting hierarchy and compensation.',
    columns: [
      { name: 'employee_id', type: 'INT', key: 'PK', desc: 'Employee Identification Number' },
      { name: 'employee_name', type: 'VARCHAR(100)', key: '', desc: 'Full Name' },
      { name: 'department_id', type: 'INT', key: 'FK', desc: 'Assigned Department' },
      { name: 'manager_id', type: 'INT', key: 'FK', desc: 'Direct Reporting Manager ID' },
      { name: 'salary', type: 'DECIMAL(12,2)', key: '', desc: 'Current Annual Salary' },
      { name: 'hire_date', type: 'DATE', key: '', desc: 'Original Hire Date' },
      { name: 'email', type: 'VARCHAR(100)', key: '', desc: 'Corporate Email' },
      { name: 'employment_status', type: 'VARCHAR(20)', key: '', desc: 'Status (active / inactive)' }
    ]
  },
  {
    tableName: 'projects',
    description: 'Strategic organizational projects, schedules, and capital allocations.',
    columns: [
      { name: 'project_id', type: 'INT', key: 'PK', desc: 'Project Identifier' },
      { name: 'project_name', type: 'VARCHAR(100)', key: '', desc: 'Project Name' },
      { name: 'department_id', type: 'INT', key: 'FK', desc: 'Owning Department' },
      { name: 'start_date', type: 'DATE', key: '', desc: 'Project Start Date' },
      { name: 'end_date', type: 'DATE', key: '', desc: 'Target or Actual Completion Date' },
      { name: 'budget', type: 'DECIMAL(12,2)', key: '', desc: 'Total Allocated Budget' }
    ]
  },
  {
    tableName: 'employee_projects',
    description: 'Staff allocation assignments and recorded contribution hours.',
    columns: [
      { name: 'employee_id', type: 'INT', key: 'PK/FK', desc: 'Assigned Staff Member' },
      { name: 'project_id', type: 'INT', key: 'PK/FK', desc: 'Assigned Project' },
      { name: 'assigned_date', type: 'DATE', key: '', desc: 'Assignment Date' },
      { name: 'hours_worked', type: 'DECIMAL(6,2)', key: '', desc: 'Recorded Billable / Effort Hours' }
    ]
  },
  {
    tableName: 'customers',
    description: 'Registered business accounts and demographic details.',
    columns: [
      { name: 'customer_id', type: 'INT', key: 'PK', desc: 'Customer Account ID' },
      { name: 'customer_name', type: 'VARCHAR(100)', key: '', desc: 'Organization / Customer Name' },
      { name: 'email', type: 'VARCHAR(100)', key: '', desc: 'Primary Billing Email' },
      { name: 'signup_date', type: 'DATE', key: '', desc: 'Platform Registration Date' },
      { name: 'country', type: 'VARCHAR(50)', key: '', desc: 'Jurisdiction / Country' }
    ]
  },
  {
    tableName: 'orders',
    description: 'Customer transactions, status lifecycles, and billed amounts.',
    columns: [
      { name: 'order_id', type: 'INT', key: 'PK', desc: 'Order Transaction ID' },
      { name: 'customer_id', type: 'INT', key: 'FK', desc: 'Purchasing Customer' },
      { name: 'order_date', type: 'DATE', key: '', desc: 'Placement Date' },
      { name: 'status', type: 'VARCHAR(20)', key: '', desc: "'completed', 'cancelled', 'pending'" },
      { name: 'total_amount', type: 'DECIMAL(10,2)', key: '', desc: 'Gross Invoice Total' }
    ]
  },
  {
    tableName: 'order_items',
    description: 'Individual line items, quantities, and negotiated discounts.',
    columns: [
      { name: 'order_item_id', type: 'INT', key: 'PK', desc: 'Line Item Entry ID' },
      { name: 'order_id', type: 'INT', key: 'FK', desc: 'Parent Order' },
      { name: 'product_id', type: 'INT', key: 'FK', desc: 'Item Catalog ID' },
      { name: 'quantity', type: 'INT', key: '', desc: 'Ordered Quantity' },
      { name: 'unit_price', type: 'DECIMAL(10,2)', key: '', desc: 'Contracted Unit Price' },
      { name: 'discount_pct', type: 'DECIMAL(5,2)', key: '', desc: 'Applied Discount (0-100%)' }
    ]
  },
  {
    tableName: 'products',
    description: 'Catalog products, pricing tiers, and active availability flags.',
    columns: [
      { name: 'product_id', type: 'INT', key: 'PK', desc: 'Catalog Product ID' },
      { name: 'product_name', type: 'VARCHAR(100)', key: '', desc: 'Product Title' },
      { name: 'category', type: 'VARCHAR(50)', key: '', desc: 'Product Classification' },
      { name: 'list_price', type: 'DECIMAL(10,2)', key: '', desc: 'Standard List Price' },
      { name: 'active', type: 'BOOLEAN', key: '', desc: 'Current Active Status' }
    ]
  },
  {
    tableName: 'payments',
    description: 'Remittance transactions, payment settlements, and completion status.',
    columns: [
      { name: 'payment_id', type: 'INT', key: 'PK', desc: 'Payment Ledger ID' },
      { name: 'order_id', type: 'INT', key: 'FK', desc: 'Associated Order ID' },
      { name: 'payment_date', type: 'DATE', key: '', desc: 'Settlement Date' },
      { name: 'amount', type: 'DECIMAL(10,2)', key: '', desc: 'Remitted Amount' },
      { name: 'payment_status', type: 'VARCHAR(20)', key: '', desc: "'successful' or 'failed'" }
    ]
  },
  {
    tableName: 'logins',
    description: 'Customer daily authentication events for streak & churn analytics.',
    columns: [
      { name: 'login_id', type: 'INT', key: 'PK', desc: 'Login Event ID' },
      { name: 'customer_id', type: 'INT', key: 'FK', desc: 'Authenticated Customer' },
      { name: 'login_date', type: 'DATE', key: '', desc: 'Date of Activity' }
    ]
  },
  {
    tableName: 'events',
    description: 'User digital telemetry, sessions, and multi-stage funnel events.',
    columns: [
      { name: 'event_id', type: 'INT', key: 'PK', desc: 'Telemetry Event ID' },
      { name: 'user_id', type: 'INT', key: '', desc: 'User / Actor ID' },
      { name: 'event_time', type: 'TIMESTAMP', key: '', desc: 'Exact Timestamp' },
      { name: 'event_type', type: 'VARCHAR(20)', key: '', desc: "'view', 'cart', 'purchase'" },
      { name: 'session_id', type: 'VARCHAR(50)', key: '', desc: 'Session Identifier' }
    ]
  },
  {
    tableName: 'salary_history',
    description: 'Historical salary adjustments, raises, and promotion timelines.',
    columns: [
      { name: 'history_id', type: 'INT', key: 'PK', desc: 'Salary Ledger ID' },
      { name: 'employee_id', type: 'INT', key: 'FK', desc: 'Staff Member' },
      { name: 'effective_date', type: 'DATE', key: '', desc: 'Effective Promotion Date' },
      { name: 'salary', type: 'DECIMAL(12,2)', key: '', desc: 'Adjusted Salary Amount' }
    ]
  }
];

