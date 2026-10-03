import { z } from 'zod';

export const focusSessionSchema = z.object({
  minutes: z.number().int().min(1, 'Focus minutes must be at least 1').max(480),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD')
    .optional(),
  taskId: z.string().optional(),
  moodRating: z.number().int().min(1).max(5).optional(),
  energyRating: z.number().int().min(1).max(5).optional(),
  moodLabel: z.enum(['Joyful', 'Calm', 'Focused', 'Tired', 'Overwhelmed', 'Neutral']).optional(),
  feelings: z.array(z.string()).optional(),
  notes: z.string().max(500).optional()
});
