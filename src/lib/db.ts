import { PrismaClient } from "../../generated/prisma/client";

const isSQLite = process.env.DATABASE_URL?.startsWith("file:");

function createClient(): PrismaClient {
  if (isSQLite) {
    return new PrismaClient();
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaPg } = require("@prisma/adapter-pg");
  const connectionString =
    process.env.DATABASE_URL ??
    `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@localhost:${process.env.POSTGRES_PORT ?? 5432}/${process.env.POSTGRES_DB}`;
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
