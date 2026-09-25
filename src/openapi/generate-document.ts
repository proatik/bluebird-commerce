import { OpenApiGeneratorV31 } from '@asteasolutions/zod-to-openapi';

import { registry } from '@/openapi/registry';

import '@/openapi/paths/orders.openapi';
import '@/openapi/paths/products.openapi';
import '@/openapi/paths/customers.openapi';

import type { OpenAPIObject } from 'openapi3-ts/oas31';

export function generateOpenApiDocument(): OpenAPIObject {
  return new OpenApiGeneratorV31(registry.definitions).generateDocument({
    openapi: '3.1.0',
    info: {
      title: 'BluBird Commerce API',
      version: '0.1.0',
      description: 'Minimal e-commerce backend — products, customers, orders.'
    },
    servers: [{ url: '/' }]
  });
}
