import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { Injectable, OnModuleDestroy } from '@nestjs/common';

import * as schema from '@/modules/database/schemas';
import { EnvService } from '@/modules/config/env.service';

type Database = ReturnType<typeof drizzle<typeof schema>>;

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  readonly db: Database;
  private readonly sql: ReturnType<typeof postgres>;

  constructor(env: EnvService) {
    this.sql = postgres(env.databaseUrl, { max: 10 });
    this.db = drizzle(this.sql, { schema });
  }

  async onModuleDestroy(): Promise<void> {
    await this.sql.end();
  }
}
