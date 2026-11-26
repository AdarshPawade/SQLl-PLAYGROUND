import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  eventType: {
    type: String,
    enum: ['visit', 'click', 'auth', 'solve'],
    required: true,
    index: true
  },
  target: {
    type: String, // e.g., 'sql_playground_main', 'run_query_button', 'user_login', 'emp_beg_1'
    required: true,
    trim: true,
    maxlength: 120,
    index: true
  },
  actor: {
    type: String,
    default: 'guest',
    trim: true,
    maxlength: 64
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

export const Analytics = mongoose.models.Analytics || mongoose.model('Analytics', analyticsSchema);
export default Analytics;
