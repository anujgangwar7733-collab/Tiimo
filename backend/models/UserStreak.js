import mongoose from 'mongoose';

const userStreakSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: 0
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0
    },
    lastCompletedDate: {
      type: String, // YYYY-MM-DD
      default: null
    },
    totalDaysCompleted: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

export const UserStreak = mongoose.model('UserStreak', userStreakSchema);
