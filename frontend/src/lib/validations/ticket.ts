import { z } from 'zod';

export const createTicketSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(3, 'Title must be at least 3 characters long')
    .max(150, 'Title cannot exceed 150 characters')
    .trim(),
  description: z
    .string()
    .min(1, 'Description is required')
    .min(10, 'Description must be at least 10 characters long')
    .max(5000, 'Description cannot exceed 5000 characters')
    .trim(),
  category: z
    .string()
    .min(1, 'Category is required')
    .min(2, 'Category must be at least 2 characters long')
    .max(50, 'Category cannot exceed 50 characters')
    .trim(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH'], {
    required_error: 'Priority is required',
    invalid_type_error: 'Priority must be LOW, MEDIUM, or HIGH',
  }),
});

export type CreateTicketFormData = z.infer<typeof createTicketSchema>;

export const updateTicketSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters long')
    .max(150, 'Title cannot exceed 150 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters long')
    .max(5000, 'Description cannot exceed 5000 characters')
    .trim()
    .optional(),
  category: z
    .string()
    .min(2, 'Category must be at least 2 characters long')
    .max(50, 'Category cannot exceed 50 characters')
    .trim()
    .optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED']).optional(),
});

export type UpdateTicketFormData = z.infer<typeof updateTicketSchema>;
