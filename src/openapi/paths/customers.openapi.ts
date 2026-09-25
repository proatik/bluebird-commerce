import { z } from 'zod';

import { createCustomerSchema, customerResponseSchema } from '@/validation';
import { registry, idParamSchema, errorResponseSchema } from '@/openapi/registry';

const tags = ['customers'];
const customerSchema = registry.register('Customer', customerResponseSchema);

registry.registerPath({
  method: 'post',
  path: '/api/customers',
  tags,
  summary: 'Create a customer.',
  request: {
    body: { content: { 'application/json': { schema: createCustomerSchema } } }
  },
  responses: {
    201: {
      description: 'The created customer.',
      content: { 'application/json': { schema: customerSchema } }
    },
    409: {
      description: 'A customer with this email already exists.',
      content: { 'application/json': { schema: errorResponseSchema } }
    }
  }
});

registry.registerPath({
  method: 'get',
  path: '/api/customers',
  tags,
  summary: 'List customers.',
  responses: {
    200: {
      description: 'All customers.',
      content: { 'application/json': { schema: z.array(customerSchema) } }
    }
  }
});

registry.registerPath({
  method: 'get',
  path: '/api/customers/{id}',
  tags,
  summary: 'Get a customer by id.',
  request: { params: idParamSchema },
  responses: {
    200: {
      description: 'The customer.',
      content: { 'application/json': { schema: customerSchema } }
    },
    404: {
      description: 'No customer with this id.',
      content: { 'application/json': { schema: errorResponseSchema } }
    }
  }
});
