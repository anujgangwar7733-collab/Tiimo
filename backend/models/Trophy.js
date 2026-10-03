import mongoose from 'mongoose';

const trophySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    badgeKey: {
      type: String,
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true
    },
    unlockedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// One trophy record per user per badge key
trophySchema.index({ userId: 1, badgeKey: 1 }, { unique: true });

export const Trophy = mongoose.model('Trophy', trophySchema);
