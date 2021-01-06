import { Redis } from "ioredis";

export const routes = {
  health: {
    GET: async (_, { redis }: { redis: Redis }) => {
      try {
        return {
          status: await redis.ping("OK"),
        };
      } catch (error) {
        return {
          status: "NOT OK",
        };
      }
    },
  },
};
