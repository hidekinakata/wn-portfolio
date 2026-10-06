import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// O Prisma CLI carrega apenas `.env`, enquanto o Next.js carrega `.env.local`.
// Carregamos ambos explicitamente para que CLI e aplicacao compartilhem as
// mesmas credenciais.
loadEnv({ path: [".env.local", ".env"] });

// `datasource.url` e usado pelo **Prisma CLI** (`migrate`, `db pull`, `db push`).
// Usamos a conexao DIRETA (`DIRECT_URL`) porque comandos DDL nao funcionam via
// connection pooler. A aplicacao em runtime usa `DATABASE_URL` (pooler) atraves
// do driver adapter em `src/lib/db.ts`.
const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  ...(url ? { datasource: { url } } : {}),
});
