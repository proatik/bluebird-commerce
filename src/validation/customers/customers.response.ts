import { z } from 'zod';

export const customerResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  createdAt: z.date()
});

export type CustomerResponse = z.infer<typeof customerResponseSchema>;
