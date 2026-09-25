import { Test } from '@nestjs/testing';

import { AppConfigModule } from '@/modules/config/config.module';
import { DatabaseModule } from '@/modules/database/database.module';
import { DatabaseService } from '@/modules/database/database.service';

export async function createTestDatabase(): Promise<DatabaseService> {
  const moduleRef = await Test.createTestingModule({
    imports: [DatabaseModule, AppConfigModule]
  }).compile();

  return moduleRef.get(DatabaseService);
}

export function uniqueSuffix(): string {
  return `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}
