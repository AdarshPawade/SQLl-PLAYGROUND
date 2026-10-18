import mongoose from 'mongoose';

const savedQuerySchema = new mongoose.Schema({
  userId: { type: String, default: 'default_guest' },
  title: { type: String, required: true },
  sql: { type: String, required: true },
  dbKey: { type: String, required: true },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

export const SavedQuery = mongoose.models.SavedQuery || mongoose.model('SavedQuery', savedQuerySchema);
