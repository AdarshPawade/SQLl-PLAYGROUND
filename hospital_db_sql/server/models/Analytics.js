import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  eventType: {
    type: String,
    enum: ['visit'],
    default: 'visit',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

export const Analytics = mongoose.models.Analytics || mongoose.model('Analytics', analyticsSchema);
export default Analytics;
