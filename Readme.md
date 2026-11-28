
# SQLl-PLAYGROUND

An interactive web-based SQL playground built with the **MERN** stack, designed for practicing SQL queries, exploring database schemas, and running commands against pre-loaded sample datasets such as a hospital management database. 

Live Demo: https://sqlpractice-playground.vercel.app 

# Overview

**SQLl-PLAYGROUND** provides an accessible browser environment where developers and students can write, execute, and test SQL queries without needing to install or configure a local database server. It includes structured sample datasets such as hospital_db_sql to help users practice real-world relational queries. 

#### Features

* Interactive SQL Query Editor:** Write and execute SQL statements directly from the browser.
* Hospital Database Sample Dataset (hospital_db_sql):** Practice realistic queries involving patients, doctors, appointments, departments, and billing records.
* **Instant Results & Error Feedback:** View formatted query outputs or clear SQL syntax and execution error messages in real time.
* Full-Stack Persistence (MERN):** Save query history, user workspaces, or custom snippets using MongoDB and Express.
* Responsive Web Interface:** Built with React for a clean, fast, and distraction-free coding experience.
* with user authentication and autorization

# Tech Stack

* Frontend:** React.js, HTML5, CSS3, JavaScript (ES6+)
* Backend:** Node.js, Express.js
* Database / Storage:** MongoDB & SQL Execution Engine
* Deployment:** Vercel

Getting Started

# Prerequisites

Ensure you have the following installed on your machine: 

* Node.js (v18 or higher)
* npm or yarn
* MongoDB (Local instance or MongoDB Atlas connection string)
* Git

#### Installation

1. Clone the repository:

bash

git clone https://github.com/AdarshPawade/SQLl-PLAYGROUND.git
cd SQLl-PLAYGROUND

Use code with caution.

Copy code text to clipboard.
2. Install dependencies: 

bash

npm install

Use code with caution.

Copy code text to clipboard.
3. Configure Environment Variables:
Create a .env file in your root directory and add your configuration: 

env

PORT=5000
MONGO_URI=your_mongodb_connection_string

Use code with caution.

Copy code text to clipboard.
4. Run the Application:

bash

npm start

Use code with caution.

Copy code text to clipboard.

Open your browser and navigate to http://localhost:3000.

# Sample Queries (hospital_db_sql)

Once inside the playground, you can test queries against the hospital database: 

sql

-- View all available tables
SHOW TABLES;

-- Fetch patients along with their assigned doctors
SELECT 
    p.patient_id,
    p.name AS patient_name,
    d.name AS doctor_name,
    d.specialization
FROM patients p
JOIN doctors d ON p.doctor_id = d.doctor_id;

Use code with caution.

Copy code text to clipboard.

#### Repository Structure

ASCII diagram

Download

Show Code

Hide Code

Download diagram SVG

ASCII

SQLl-PLAYGROUND/
├── hospital_db_sql/      # SQL schema and seed data for the hospital database
├── client/               # React frontend
├── server/               # Node.js & Express backend
├── package.json          # Project dependencies and scripts
├── package-lock.json     # Dependency lockfile
└── Readme.md             # Project documentation

Use code with caution.

Copy code text to clipboard.

# Contributing

Contributions, issues, and feature requests are welcome! 

1. Fork the repository.
2. Create a new branch (git checkout -b feature/your-feature).
3. Commit your changes (git commit -m 'Add some feature').
4. Push to the branch (git push origin feature/your-feature).
5. Open a Pull Request.

#### Author

**Adarsh Pawade** 

* GitHub: @AdarshPawade
* Live App: https://sq-ll-playground.vercel.app

#### License

This project is open-source and available under the MIT License.
