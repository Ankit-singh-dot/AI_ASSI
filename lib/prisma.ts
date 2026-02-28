import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 20000,       // Release idle connections after 20s (Neon drops them after 30s)
    connectionTimeoutMillis: 10000,  // Fail fast if connection takes too long
    allowExitOnIdle: true,           // Let the process exit if pool is idle (good for serverless)
});

// Prevent unhandled pool errors from crashing the server
pool.on("error", (err) => {
    console.error("PG Pool background error (non-fatal):", err.message);
});

const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter,
        log:
            process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
