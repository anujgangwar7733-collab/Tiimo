import mongoose from 'mongoose';

const dailyFocusSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    // YYYY-MM-DD
    date: {
      type: String,
      required: true,
      index: true
    },
    focusMinutesCompleted: {
      type: Number,
      default: 0,
      min: 0
    },
    focusSessionsCount: {
      type: Number,
      default: 0
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
    },
    streaksCount: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: true
  }
);

// One daily record per user per day
dailyFocusSchema.index({ userId: 1, date: 1 }, { unique: true });

export const DailyFocus = mongoose.model('DailyFocus', dailyFocusSchema);
