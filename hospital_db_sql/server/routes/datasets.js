import express from 'express';
import { EMPLOYEE_SCHEMA_INFO, HOSPITAL_SCHEMA_INFO } from '../../src/database/schema.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    datasets: {
      employee_db: {
        title: 'Employee Database Schema',
        description: 'Enterprise Relational Database with 5 core tables: departments, employees, salaries, projects, employee_projects.',
        tables: EMPLOYEE_SCHEMA_INFO
      },
      hospital_db: {
        title: 'Hospital IoMT Database Schema',
        description: 'Healthcare Telemetry Database with 5 core tables: departments, doctors, patients, admissions, smart_equipment.',
        tables: HOSPITAL_SCHEMA_INFO
      }
    }
  });
});

export default router;
