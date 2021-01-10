import { RedisOptions } from "ioredis";
import path from "path";

if (typeof process !== undefined) {
  require("dotenv").config();
} else {
  let process = { env: {} };
}

export const redis = process.env.DATABASE_URL;
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

export const appUrl = process.env.APP_URL;
