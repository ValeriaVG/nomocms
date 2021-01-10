import { RedisOptions } from "ioredis";
import path from "path";

if (typeof process !== undefined) {
  require("dotenv").config();
} else {
  let process = { env: {} };
}

export const redis: RedisOptions = {
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT && parseInt(process.env.REDIS_PORT),
  tls: Boolean(process.env.REDIS_TLS) as any,
};
export const dashboard = {
  pathname: "/admin",
  dist: path.resolve(__dirname, "..", ".dashboard"),
  get path(): string {
    return this.pathname + "/";
  },
};

export const recaptcha = {} as any; /*{
  siteKey: process.env.RECAPTCHA_SITE_KEY,
  secretKey: process.env.RECAPTCHA_SECRET_KEY,
};*/

export const superuser = {
  email: process.env.SUPERUSER_EMAIL,
  password: process.env.SUPERUSER_PASSWORD,
};

export const baseUrl = process.env.BASE_URL;
