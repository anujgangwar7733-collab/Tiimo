import { z } from 'zod';

const subtaskSchema = z.object({
  title: z.string().min(1, 'Subtask title cannot be empty'),
  completed: z.boolean().default(false)
});

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(140),
  description: z.string().optional().default(''),
  category: z
    .enum(['Routine', 'Work', 'Personal', 'Wellness', 'Creative', 'Habits', 'Other'])
    .default('Routine'),
  icon: z.string().default('Clock'),
  tintId: z
    .enum(['lavender', 'mint', 'peach', 'sky', 'rose', 'yellow', 'cream', 'gray'])
    .default('lavender'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Start time must be in HH:mm 24-hour format'),
  duration: z
    .number()
    .int()
    .min(5, 'Duration must be at least 5 minutes')
    .max(720, 'Duration cannot exceed 12 hours')
    .default(30),
  isCompleted: z.boolean().optional().default(false),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  repeat: z.enum(['none', 'daily', 'weekdays', 'custom']).default('none'),
  reminderOffset: z.number().int().min(0).max(1440).default(10),
  order: z.number().int().optional().default(0),
  subtasks: z.array(subtaskSchema).optional().default([])
});

export const updateTaskSchema = createTaskSchema.partial();

export const reorderTasksSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().min(1),
      order: z.number().int(),
      startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional()
    })
  ).min(1, 'Must provide at least one item to reorder')
});

export const dateQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'date parameter must be in YYYY-MM-DD format')
    .optional()
});

export const rangeQuerySchema = z.object({
  start: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'start date must be in YYYY-MM-DD format'),
  end: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'end date must be in YYYY-MM-DD format')
});
