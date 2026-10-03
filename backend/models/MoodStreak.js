import mongoose from 'mongoose';

const moodStreakSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    // ISO Date string: YYYY-MM-DD
    date: {
      type: String,
      required: [true, 'Date string (YYYY-MM-DD) is required'],
      index: true
    },
    focusMinutes: {
      type: Number,
      default: 0,
      min: 0
    },
    streakCount: {
      type: Number,
      default: 1,
      min: 0
    },
    moodRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },
    energyRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },
    moodLabel: {
      type: String,
      enum: ['Joyful', 'Calm', 'Focused', 'Tired', 'Overwhelmed', 'Neutral'],
      default: 'Calm'
    },
    feelings: {
      type: [String],
      default: []
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// One mood & focus streak entry per user per calendar day
moodStreakSchema.index({ userId: 1, date: 1 }, { unique: true });

export const MoodStreak = mongoose.model('MoodStreak', moodStreakSchema);
export const DailyFocus = MoodStreak; // Backward-compatibility alias
