import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

import { envSchema } from '@/modules/config/env.schema';

const env = envSchema.parse(process.env);

export default defineConfig({
  out: './drizzle',
  dialect: 'postgresql',
  schema: './src/modules/database/schemas/index.ts',
  dbCredentials: {
    url: env.DATABASE_URL
  }
});
