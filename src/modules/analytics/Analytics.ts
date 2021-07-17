import { ColumnDefinition, createTable, sql, SQLDataSource } from "core/sql";

export type PageEventInput = {
  event: string;
  path: string;
  user_id?: number;
  ip?: string;
  headers?: Record<string, string | string[]>;
  payload?: Record<string, string>;
  time?: number;
};

export type PageEvent = PageEventInput & { time: number };

export default class Analytics extends SQLDataSource<
  PageEvent,
  PageEventInput
> {
  readonly collection = "analytics";

  readonly schema: Record<keyof PageEvent, ColumnDefinition> = {
    time: { type: "timestamp", default: "NOW()" },
    event: { type: "varchar", length: 255 },
    path: { type: "varchar", length: 255 },
    user_id: { type: "int", nullable: true },
    ip: { type: "inet", nullable: true },
    headers: { type: "jsonb", nullable: true },
    payload: { type: "jsonb", nullable: true },
  };

  async viewsPerDay({
    from,
    to,
  }: {
    from: Date;
    to: Date;
  }): Promise<Array<{ date: Date; pageviews: number }>> {
    const { rows: items } = await this.context.db.query(
      sql`SELECT "time"::date as date, COUNT(*)::int as count FROM ${this.collection} WHERE "event"='pageview' AND "time" BETWEEN $1 and $2 GROUP BY "time"::date ORDER BY "time"::date ASC`,
      [from, to]
    );
    return items;
  }

  readonly migrations = {
    init: {
      up: createTable("analytics", this.schema, { ifNotExists: true }),
      down: sql`DROP TABLE  IF EXISTS analytics`,
    },
    enable_timescaledb: {
      up: sql`CREATE EXTENSION IF NOT EXISTS timescaledb;`,
      down: sql`SELECT 1`,
    },
    init_analytics_hypertable: {
      up: sql`
      DROP TABLE IF EXISTS analytics;
      ${createTable("analytics", this.schema, { ifNotExists: true })};
      SELECT create_hypertable('analytics','time');
      CREATE INDEX ON analytics (event, time DESC);
      `,
      down: sql`DROP TABLE IF EXISTS analytics`,
    },
    foreign_user_id: {
      up: sql`ALTER TABLE analytics ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE`,
      down: sql`ALTER TABLE analytics DROP FOREIGN KEY (user_id)`,
    },
  };
}
