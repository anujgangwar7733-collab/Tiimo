import mongoose from 'mongoose';

const subtaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  }
});

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must belong to a user'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxLength: [140, 'Title cannot exceed 140 characters']
    },
    category: {
      type: String,
      default: 'General',
      trim: true
    },
    icon: {
      type: String,
      default: 'Clock'
    },
    // Primary hex accent color (e.g. #52B788)
    color: {
      type: String,
      default: '#52B788'
    },
    // Tiimo pastel tint identifier
    tintId: {
      type: String,
      enum: ['mint', 'lavender', 'yellow', 'sky', 'coral'],
      default: 'mint'
    },
    // Date string in ISO format YYYY-MM-DD
    date: {
      type: String,
      required: [true, 'Task date (YYYY-MM-DD) is required'],
      index: true
    },
    // 24-hour format HH:mm e.g. "09:30"
    startTime: {
      type: String,
      required: [true, 'Start time (HH:mm) is required']
    },
    // End time in HH:mm format, computed automatically if omitted
    endTime: {
      type: String
    },
    // Duration in minutes
    duration: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
      min: [1, 'Duration must be at least 1 minute'],
      max: [1440, 'Duration cannot exceed 24 hours'],
      default: 30
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    // Reminder offset in minutes (e.g. 10 minutes before start) or null
    reminder: {
      type: Number,
      default: 10
    },
    order: {
      type: Number,
      default: 0
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    subtasks: [subtaskSchema]
  },
  {
    timestamps: true
  }
);

// Pre-save hook to calculate endTime automatically from startTime and duration
taskSchema.pre('save', function (next) {
  if (this.startTime && this.duration) {
    const [hours, minutes] = this.startTime.split(':').map(Number);
    if (!isNaN(hours) && !isNaN(minutes)) {
      const totalMinutes = hours * 60 + minutes + this.duration;
      const endH = Math.floor(totalMinutes / 60) % 24;
      const endM = totalMinutes % 60;
      this.endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
    }
  }
  next();
});

// Composite index for ultra-fast timeline & schedule queries
taskSchema.index({ userId: 1, date: 1, order: 1, startTime: 1 });

export const Task = mongoose.model('Task', taskSchema);
