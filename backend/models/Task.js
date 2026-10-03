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
    description: {
      type: String,
      trim: true,
      default: ''
    },
    category: {
      type: String,
      enum: ['Routine', 'Work', 'Personal', 'Wellness', 'Creative', 'Habits', 'Other'],
      default: 'Routine'
    },
    icon: {
      type: String,
      default: 'Clock'
    },
    // Notion-style pastel tint ID
    tintId: {
      type: String,
      enum: ['lavender', 'mint', 'peach', 'sky', 'rose', 'yellow', 'cream', 'gray'],
      default: 'lavender'
    },
    // Date string in ISO format YYYY-MM-DD
    date: {
      type: String,
      required: [true, 'Task date (YYYY-MM-DD) is required'],
      index: true
    },
    // 24h format HH:mm e.g. "09:30"
    startTime: {
      type: String,
      required: [true, 'Start time (HH:mm) is required']
    },
    duration: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
      min: [5, 'Duration must be at least 5 minutes'],
      max: [720, 'Duration cannot exceed 12 hours'],
      default: 30
    },
    endTime: {
      type: String
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    repeat: {
      type: String,
      enum: ['none', 'daily', 'weekdays', 'custom'],
      default: 'none'
    },
    reminderOffset: {
      type: Number,
      default: 10 // minutes before start
    },
    order: {
      type: Number,
      default: 0
    },
    subtasks: [subtaskSchema]
  },
  {
    timestamps: true
  }
);

// Pre-save hook to calculate endTime from startTime and duration
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

// Composite index for fast timeline queries
taskSchema.index({ userId: 1, date: 1, order: 1, startTime: 1 });

export const Task = mongoose.model('Task', taskSchema);
