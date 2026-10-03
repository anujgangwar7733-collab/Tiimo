import mongoose from 'mongoose';

const moodLogSchema = new mongoose.Schema(
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
    mood: {
      type: String,
      enum: ['energized', 'focused', 'neutral', 'tired', 'overwhelmed'],
      required: true
    },
    energyLevel: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },
    note: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Compound index: exactly 1 mood log per user per day; updates on conflict
moodLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export const MoodLog = mongoose.model('MoodLog', moodLogSchema);
