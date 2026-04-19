import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_PORT } = process.env;

if (!POSTGRES_USER || !POSTGRES_PASSWORD || !POSTGRES_DB || !POSTGRES_PORT)
   throw new Error('prisma: failed to initialize client');

export default defineConfig({
   schema: 'prisma/schema.prisma',
   migrations: {
      path: 'prisma/migrations',
   },
   datasource: {
      url: `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:${POSTGRES_PORT}/${POSTGRES_DB}`,
   },
});
