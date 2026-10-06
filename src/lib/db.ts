import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Prisma 7 exige um driver adapter. Em runtime usamos `DATABASE_URL`
 * (connection pooling / pgBouncer) — nunca `DIRECT_URL`, que e reservada para
 * migracoes via CLI (ver `prisma.config.ts`).
 */
function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL nao definida. Preencha .env.local (ver .env.exemple).",
    );
  }
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
}

// Singleton global: evita esgotar conexoes em desenvolvimento com hot reload.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
