import "server-only";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../generated/prisma/client";

function createPrismaClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing.");
  }

  const url = new URL(process.env.DATABASE_URL);

  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.slice(1)),
    connectionLimit: 5,
  });

  return new PrismaClient({ adapter });
}

export const prisma = globalThis.daplPrisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.daplPrisma = prisma;
}
