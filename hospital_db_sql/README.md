# SQL Practice Playground 🚀

A single-page, fully interactive web-based **SQL Practice Playground** built using **React** and **sql.js (SQLite WebAssembly)**. Practice 110 real-world MySQL / SQLite queries across two pre-seeded database schemas (**Employee Database** & **Hospital IoMT Database**).

![SQL Playground Screenshot](brain/864adde5-2291-4abc-a240-d86d4d59c8e9/final_verification_1788566302535.png)

---

## ✨ Features

- ⚡ **100% In-Browser SQLite Engine**: Database runs entirely inside WebAssembly using `sql.js`. Zero backend dependencies or server setup required.
- 🗄️ **Dual Database Schemas**:
  - **Employee Database (Primary)**: `departments`, `employees`, `salaries`, `projects`, `employee_projects`.
  - **Hospital Database (IoMT Platform)**: `departments`, `doctors`, `patients`, `admissions`, `smart_equipment`.
- 📚 **110 Practice Questions**:
  - **Beginner Level (20 Qs)**: Table creation (`CREATE TABLE`), record inserts/updates/deletes (`INSERT`, `UPDATE`, `DELETE`), filtering (`SELECT`, `WHERE`), and sorting (`ORDER BY`, `LIMIT`).
  - **Intermediate Level (40 Qs)**: `INNER JOIN`, `LEFT JOIN`, `GROUP BY`, `HAVING`, `MIN`, `MAX`, `AVG`, `COUNT`, `SUM`, string & date functions.
  - **Pro Level (50 Qs)**: Multi-table 4-way joins, Views, Composite Indexes, Transactions (`COMMIT`/`ROLLBACK`), Window functions (`RANK`, `ROW_NUMBER`, `LEAD`, `DENSE_RANK`), CTEs (`WITH`), and SQL Injection mechanics.
- 🔄 **Repeatable Query Execution**: Re-running any query 1 or 100 times always evaluates correctly against problem criteria without constraint errors.
- 💡 **Session Live State Mutation**: Correct DDL/DML queries modify the active session database in real-time, letting users observe live row changes in sample data views.
- 🧹 **Database Reset**: Resets active session tables back to 5 default seed rows per table.
- 🔍 **Interactive Schema Inspector**: View table structures, data types, primary/foreign keys, and preview sample rows.
- 🧪 **100% Automated Test Suite**: Headless test runner (`npm test`) validating all 110 questions, case-insensitivity, and repeatable query logic.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm`

### Installation & Local Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/sql-practice-playground.git
   cd sql-practice-playground
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://127.0.0.1:3000`.

4. **Run Automated Test Suite**:
   ```bash
   npm test
   ```

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Database**: [sql.js WebAssembly](https://sql.js.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: Vanilla CSS (CSS Grid, Flexbox, Custom Themes)

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
