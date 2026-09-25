import { apiReference } from '@scalar/nestjs-api-reference';

import type { Request, Response } from 'express';
import type { INestApplication } from '@nestjs/common';
import type { OpenAPIObject } from 'openapi3-ts/oas31';

export function mountApiDocs(
  app: INestApplication,
  document: OpenAPIObject
): void {
  const adapter = app.getHttpAdapter();

  adapter.get('/api/openapi.json', (_req: Request, res: Response) => {
    res.json(document);
  });

  adapter.get('/api/docs', apiReference({ url: '/api/openapi.json' }));
}
