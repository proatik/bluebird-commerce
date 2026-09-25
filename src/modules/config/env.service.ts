import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { Env } from '@/modules/config/env.schema';

@Injectable()
export class EnvService {
  constructor(private readonly config: ConfigService<Env, true>) {}

  get<T extends keyof Env>(key: T): Env[T] {
    return this.config.get(key, { infer: true });
  }

  get port(): number {
    return this.get('PORT');
  }

  get databaseUrl(): string {
    return this.get('DATABASE_URL');
  }

  get openaiApiKey(): string {
    return this.get('OPENAI_API_KEY');
  }

  get openaiModel(): string {
    return this.get('OPENAI_MODEL');
  }
}
