import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
    lowercase: true,
    minlength: 3,
    maxlength: 32,
    index: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
    lowercase: true,
    index: true 
  },
  passwordHash: { 
    type: String, 
    required: true 
  },
  salt: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['STUDENT', 'DOCTOR', 'ADMIN'], 
    default: 'STUDENT',
    index: true 
  },
  profile: {
    fullName: { type: String, default: '' },
    avatar: { type: String, default: '' },
    targetTrack: { type: String, default: 'fullstack' }, // 'analyst', 'swe', 'healthcare'
    onboarded: { type: Boolean, default: false }
  },
  twoFactorSecret: { 
    type: String, 
    default: null 
  },
  twoFactorEnabled: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  lastLogin: { 
    type: Date, 
    default: Date.now 
  }
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
