import { z } from 'zod';

export const yearSchema = z.object({
  year: z.number().min(2000).max(2100),
});

export const tabSchema = z.object({
  name: z.string().min(1).max(50),
  icon: z.string(),
});

export const tableSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['Expense', 'Income', 'Transfer', 'Loan', 'None']),
  fields: z.array(z.object({
    name: z.string().min(1),
    type: z.enum(['Text', 'Number', 'Date', 'Month', 'Dropdown']),
    currency: z.enum(['USD', 'INR', 'None']).optional(),
    isPrimary: z.boolean().optional(),
    dropdownOptions: z.array(z.object({ id: z.string(), label: z.string() })).optional(),
  })).min(1),
});

export const fieldSchema = z.object({
  name: z.string().min(1).max(50),
  type: z.enum(['Text', 'Number', 'Date', 'Month', 'Dropdown']),
  currency: z.enum(['USD', 'INR', 'None']).optional(),
  isPrimary: z.boolean().optional(),
});

export const settingsSchema = z.object({
  exchangeRate: z.number().positive(),
  displayCurrency: z.enum(['USD', 'INR']),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});