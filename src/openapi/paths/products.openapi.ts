import { z } from 'zod';

import { registry, idParamSchema, errorResponseSchema } from '@/openapi/registry';
import {
  createProductSchema,
  updateProductSchema,
  searchProductsSchema,
  messageResponseSchema,
  productResponseSchema
} from '@/validation';

const tags = ['products'];
const productSchema = registry.register('Product', productResponseSchema);

registry.registerPath({
  method: 'post',
  path: '/api/products',
  tags,
  summary: 'Create a product.',
  request: {
    body: { content: { 'application/json': { schema: createProductSchema } } }
  },
  responses: {
    201: {
      description: 'The created product.',
      content: { 'application/json': { schema: productSchema } }
    },
    409: {
      description: 'A product with this SKU already exists.',
      content: { 'application/json': { schema: errorResponseSchema } }
    }
  }
});

registry.registerPath({
  method: 'get',
  path: '/api/products',
  tags,
  summary: 'List or search products.',
  request: { query: searchProductsSchema },
  responses: {
    200: {
      description: 'Matching products.',
      content: { 'application/json': { schema: z.array(productSchema) } }
    }
  }
});

registry.registerPath({
  method: 'get',
  path: '/api/products/{id}',
  tags,
  summary: 'Get a product by id.',
  request: { params: idParamSchema },
  responses: {
    200: {
      description: 'The product.',
      content: { 'application/json': { schema: productSchema } }
    },
    404: {
      description: 'No product with this id.',
      content: { 'application/json': { schema: errorResponseSchema } }
    }
  }
});

registry.registerPath({
  method: 'patch',
  path: '/api/products/{id}',
  tags,
  summary: 'Update a product.',
  request: {
    params: idParamSchema,
    body: { content: { 'application/json': { schema: updateProductSchema } } }
  },
  responses: {
    200: {
      description: 'The updated product.',
      content: { 'application/json': { schema: productSchema } }
    },
    404: {
      description: 'No product with this id.',
      content: { 'application/json': { schema: errorResponseSchema } }
    }
  }
});

registry.registerPath({
  method: 'delete',
  path: '/api/products/{id}',
  tags,
  summary: 'Delete a product.',
  request: { params: idParamSchema },
  responses: {
    200: {
      description: 'Product deleted.',
      content: { 'application/json': { schema: messageResponseSchema } }
    },
    404: {
      description: 'No product with this id.',
      content: { 'application/json': { schema: errorResponseSchema } }
    }
  }
});
