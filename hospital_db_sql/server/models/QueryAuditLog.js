import mongoose from 'mongoose';

const queryAuditLogSchema = new mongoose.Schema({
  dbKey: { type: String, required: true },
  userSql: { type: String, required: true },
  executionTimeMs: { type: Number, required: true },
  isMatch: { type: Boolean, required: true },
  status: { type: String, enum: ['SUCCESS', 'SYNTAX_ERROR', 'BLOCKED_SECURITY_RISK'], default: 'SUCCESS' },
  ip: { type: String },
  timestamp: { type: Date, default: Date.now }
});

export const QueryAuditLog = mongoose.models.QueryAuditLog || mongoose.model('QueryAuditLog', queryAuditLogSchema);
