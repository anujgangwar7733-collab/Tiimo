import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long').max(60),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  timezone: z.string().optional(),
  preferences: z
    .object({
      theme: z.enum(['warm-minimal', 'dark-slate', 'lavender-mist', 'sage-tranquility']).optional(),
      soundEnabled: z.boolean().optional(),
      visualMode: z.enum(['pastel', 'bold']).optional(),
      notificationEnabled: z.boolean().optional()
    })
    .optional()
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  avatar: z.string().url().or(z.literal('')).optional(),
  timezone: z.string().optional(),
  preferences: z
    .object({
      theme: z.enum(['warm-minimal', 'dark-slate', 'lavender-mist', 'sage-tranquility']).optional(),
      soundEnabled: z.boolean().optional(),
      visualMode: z.enum(['pastel', 'bold']).optional(),
      notificationEnabled: z.boolean().optional()
    })
    .optional()
});
