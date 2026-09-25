import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const createCustomerSchema = z.object({
  name: z.string().min(1),
  email: z.email()
});

export class CreateCustomerDto extends createZodDto(createCustomerSchema) {}
