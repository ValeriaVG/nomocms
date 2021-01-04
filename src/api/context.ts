import Redis from "ioredis";
import { redis as redisOptions } from "config";

export const redis = new Redis(redisOptions);
export const log = console;
