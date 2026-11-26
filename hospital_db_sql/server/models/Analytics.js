import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  eventType: {
    type: String,
    enum: ['visit', 'click'],
    required: true,
    index: true
  },
  target: {
    type: String, // e.g., 'sql_playground_main', 'run_query_button', 'reset_query_button'
    required: true,
    trim: true,
    maxlength: 120,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

export const Analytics = mongoose.models.Analytics || mongoose.model('Analytics', analyticsSchema);
export default Analytics;
