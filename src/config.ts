import { RedisOptions } from "ioredis";
import path from "path";

export const redis: RedisOptions = {};
export const dashboard = {
  path: "/admin/",
  dist: path.resolve(__dirname, "..", ".dashboard"),
};
