import mongoose from 'mongoose';

const savedQuerySchema = new mongoose.Schema({
  userId: { type: String, default: 'default_guest' },
  title: { type: String, required: true },
  sql: { type: String, required: true },
  dbKey: { type: String, required: true },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

// High-speed lookup index for 1,000+ users
savedQuerySchema.index({ userId: 1, createdAt: -1 });

export const SavedQuery = mongoose.models.SavedQuery || mongoose.model('SavedQuery', savedQuerySchema);

