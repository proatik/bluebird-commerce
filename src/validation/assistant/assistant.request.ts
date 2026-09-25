import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const chatRequestSchema = z.object({
  customerId: z.string().min(1),
  message: z.string().min(1),
  conversationId: z.string().optional()
});

export class ChatRequestDto extends createZodDto(chatRequestSchema) {}
