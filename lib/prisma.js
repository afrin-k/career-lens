// import { PrismaClient } from "@prisma/client";

// export const db = globalThis.prisma || new PrismaClient();

// if(process.env.NODE_ENV !== "production") {
//     globalThis.prisma = db;
// }

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const prismaClientSingleton = () => {
  // 1. Create a standard PostgreSQL connection pool
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  
  // 2. Wrap it in the Prisma Adapter
  const adapter = new PrismaPg(pool);

  // 3. Pass the adapter to the Prisma Client
  return new PrismaClient({ adapter });
};

export const db = globalThis.prisma || prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}

// globalThis.prisma : this global variable ensures that the Prisma client instance is reused across hot reloads during development.
// Without this, each time your application reloads, a new instance of the Prisma client would be created, 
// potentially loading to connection issues.