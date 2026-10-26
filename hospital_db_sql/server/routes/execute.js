import express from 'express';
import { executeInSandbox } from '../sandbox/sqlSandbox.js';
import { QueryAuditLog } from '../models/QueryAuditLog.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { userSql, expectedQuery, verificationQuery, dbKey } = req.body;

  if (!userSql) {
    return res.status(400).json({ success: false, error: 'userSql parameter is required.' });
  }

  const result = await executeInSandbox(
    userSql,
    expectedQuery || '',
    verificationQuery || '',
    dbKey || 'employee_db'
  );

  // Asynchronously record security audit log if MongoDB is connected
  try {
    if (QueryAuditLog) {
      QueryAuditLog.create({
        dbKey: dbKey || 'employee_db',
        userSql,
        executionTimeMs: result.executionTimeMs,
        isMatch: result.isMatch,
        status: result.securityAudit,
        ip: req.ip
      }).catch(() => {});
    }
  } catch {
    // Ignore audit log error if db offline
  }

  res.json({
    success: true,
    ...result
  });
});

export default router;
