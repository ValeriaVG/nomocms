import { PoolConfig } from "pg";
require("dotenv").config();

export const redis = process.env.REDIS_URL;

export const db: PoolConfig = {
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT as any,
  user: process.env.DATABASE_USER ?? "nomocms",
  password: process.env.DATABASE_PASSWORD ?? "nomocms",
  ssl: process.env.DATABASE_CA
    ? {
        ca: process.env.DATABASE_CA,
      }
    : false,
};

export const recaptcha = {} as any; /*{
  siteKey: process.env.RECAPTCHA_SITE_KEY,
  secretKey: process.env.RECAPTCHA_SECRET_KEY,
};*/

export const superuser = {
  email: process.env.SUPERUSER_EMAIL,
  password: process.env.SUPERUSER_PASSWORD,
};

export const appUrl = process.env.APP_URL;

export const version = require("../package.json").version;
