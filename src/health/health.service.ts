import { sql } from 'drizzle-orm';
import { Injectable } from '@nestjs/common';

import { DatabaseService } from '@/modules/database/database.service';

type DependencyStatus = 'ok' | 'error';

export interface HealthStatus {
  status: DependencyStatus;
  database: DependencyStatus;
}

@Injectable()
export class HealthService {
  constructor(private readonly database: DatabaseService) {}

  async check(): Promise<HealthStatus> {
    const database = await this.checkPostgres();

    return { status: database, database };
  }

  private async checkPostgres(): Promise<DependencyStatus> {
    try {
      await this.database.db.execute(sql`select 1`);

      return 'ok';
    } catch {
      return 'error';
    }
  }
}
