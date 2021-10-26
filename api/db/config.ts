import { PoolConfig } from "pg";

const dbConfig: PoolConfig = {
  host: process.env.DATABASE_HOST ?? "localhost",
  port: Number(process.env.DATABASE_PORT ?? 5432),
  user: process.env.DATABASE_USER ?? "nomocms",
  password: process.env.DATABASE_PASSWORD ?? "nomocms",
  ssl: process.env.DATABASE_CA
    ? {
        ca: process.env.DATABASE_CA,
      }
    : false,
};

export default dbConfig;
