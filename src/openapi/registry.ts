import { z } from 'zod';
import {
  OpenAPIRegistry,
  extendZodWithOpenApi
} from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

export const idParamSchema = z.object({ id: z.string() });

export const errorResponseSchema = registry.register(
  'Error',
  z.object({
    message: z.union([z.string(), z.array(z.record(z.string(), z.unknown()))]),
    error: z.string(),
    statusCode: z.number()
  })
);
