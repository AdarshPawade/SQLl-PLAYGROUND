// Test runner for 50 Hard Interview Questions
const INTERVIEW_INITIAL_SQL = `
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

export { INTERVIEW_INITIAL_SQL };
