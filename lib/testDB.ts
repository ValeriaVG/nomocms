import { Pool } from "pg";

export const createTestDB = () =>
  new Pool({
    user: "nomocms",
    password: "nomocms",
    database: "nomotest",
  });
