import '@/openapi/registry';

import { NestFactory } from '@nestjs/core';

import { AppModule } from '@/app.module';
import { mountApiDocs } from '@/openapi/mount-docs';
import { EnvService } from '@/modules/config/env.service';
import { generateOpenApiDocument } from '@/openapi/generate-document';
import { ZodValidationPipe } from '@/common/pipes/zod-validation.pipe';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const env = app.get(EnvService);

  app.useGlobalPipes(new ZodValidationPipe());
  app.setGlobalPrefix('api', { exclude: ['health'] });

  mountApiDocs(app, generateOpenApiDocument());

  await app.listen(env.port);
}

bootstrap();
