import { z } from 'zod';

export const chatResponseSchema = z.object({
  reply: z.string(),
  conversationId: z.string()
});

export type ChatResponse = z.infer<typeof chatResponseSchema>;
