import "dotenv/config";
import { defineConfig } from "prisma/config";

const isSQLite = process.env.DATABASE_URL?.startsWith("file:");

if (!isSQLite) {
  const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_PORT } = process.env;
  if (!POSTGRES_USER || !POSTGRES_PASSWORD || !POSTGRES_DB || !POSTGRES_PORT)
    throw new Error("prisma: failed to initialize client");
}

const datasourceUrl = isSQLite
  ? process.env.DATABASE_URL!
  : `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@localhost:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;

export default defineConfig({
  schema: isSQLite ? "prisma-sqlite/schema.prisma" : "prisma/schema.prisma",
  migrations: {
    path: isSQLite ? "prisma-sqlite/migrations" : "prisma/migrations",
  },
  datasource: {
    url: datasourceUrl,
  },
});
