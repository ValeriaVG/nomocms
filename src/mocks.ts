import { newDb } from "pg-mem";
import { Client } from "pg";

export const mockDatabase = () => {
  const db = newDb();
  return {
    query: async (query: string, values: any[]) =>
      db.public.query(
        query.replace(/\$(\d+)/gi, (s) => {
          const idx = parseInt(s.slice(1));
          const value = values[idx - 1];
          return typeof value === "string"
            ? `'${value}'`
            : JSON.stringify(value);
        })
      ),
  } as Client;
};
