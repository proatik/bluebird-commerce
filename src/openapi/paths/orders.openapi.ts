import { z } from 'zod';

import { createOrderSchema, orderResponseSchema } from '@/validation';
import { registry, idParamSchema, errorResponseSchema } from '@/openapi/registry';

const tags = ['orders'];
const orderSchema = registry.register('Order', orderResponseSchema);

registry.registerPath({
  method: 'post',
  path: '/api/orders',
  tags,
  summary: 'Place an order.',
  request: {
    body: { content: { 'application/json': { schema: createOrderSchema } } }
  },
  responses: {
    201: {
      description: 'The created order.',
      content: { 'application/json': { schema: orderSchema } }
    },
    404: {
      description: 'The customer or a product in the order was not found.',
      content: { 'application/json': { schema: errorResponseSchema } }
    },
    409: {
      description: 'A product in the order has insufficient stock.',
      content: { 'application/json': { schema: errorResponseSchema } }
    }
  }
});

registry.registerPath({
  method: 'get',
  path: '/api/orders',
  tags,
  summary: "List orders, optionally filtered by a customer's id.",
  request: { query: z.object({ customerId: z.string().optional() }) },
  responses: {
    200: {
      description: 'Matching orders.',
      content: { 'application/json': { schema: z.array(orderSchema) } }
    }
  }
});

registry.registerPath({
  method: 'get',
  path: '/api/orders/{id}',
  tags,
  summary: 'Get an order by id.',
  request: { params: idParamSchema },
  responses: {
    200: {
      description: 'The order.',
      content: { 'application/json': { schema: orderSchema } }
    },
    404: {
      description: 'No order with this id.',
      content: { 'application/json': { schema: errorResponseSchema } }
    }
  }
});
