import { HTTPUserInputError } from "core/errors";
import {
  ColumnDefinition,
  createTable,
  deleteFrom,
  dropTable,
  insertInto,
  Query,
  selectFrom,
  SelectOptions,
  update,
} from "core/sql";
import { Client } from "pg";

import { CRUDLDataSource } from "./types";

/**
 * Primary CRUD interface for generic entities
 * stored in PostgreSQL table
 */
export default abstract class SQLDataSource<
  T extends Record<string, any>,
  I extends Record<string, any> = Partial<T>,
  P extends Record<string, any> = Partial<I>
> extends CRUDLDataSource<T, I, P> {
  /**
   * Table name
   */
  readonly collection: string;

  /**
   * PostgreSQL table schema
   */
  readonly schema: Record<string, ColumnDefinition>;

  readonly primaryKey?: Array<keyof T> | keyof T;

  /**
   * Migrations for that particular source
   */
  readonly migrations: Record<string, { up: string; down: string }>;

  /**
   * Requires context with db
   * @param context
   */
  constructor(protected context: { db: Client }) {
    super(context);
  }

  get defaultMigrations() {
    return {
      init: {
        up: createTable(this.collection, this.schema, { ifNotExists: true }),
        down: dropTable("users", { ifExists: true }),
      },
    };
  }

  prepare(input: any): I {
    return Object.entries(input).reduce((a, [key, value]) => {
      if (key in this.schema) a[key] = value;
      return a;
    }, {} as any);
  }

  /**
   * Check if item with provided id exists
   * @param id
   */
  exists(where: Query) {
    return this.context.db
      .query(...selectFrom(this.collection, { where, columns: "COUNT(*)" }))
      .then(({ rows }) => Boolean(rows[0][0]));
  }

  /**
   * Retrieve item by id
   * @param id
   */
  get(id: number | string, field?: keyof T): Promise<T | any> {
    return this.findOne({
      where: { id },
      columns: [(field as string) ?? "*"],
    }).then((result) => {
      if (field) return result[field] as T;
      return result as any;
    });
  }

  /**
   * Retrieve item by query
   * @param options
   */
  findOne(options: SelectOptions): Promise<T | undefined> {
    return this.context.db
      .query(...selectFrom(this.collection, options))
      .then(({ rows }) => {
        return rows[0];
      });
  }

  /**
   * Retrieve items by query
   * @param options
   */
  find(options: SelectOptions): Promise<T[]> {
    return this.context.db
      .query(...selectFrom(this.collection, options))
      .then(({ rows }) => {
        return rows;
      });
  }

  /**
   * Create new item
   * @param input
   */
  create(input: I) {
    return this.context.db
      .query(
        ...insertInto(this.collection, this.prepare(input), { returning: "*" })
      )
      .then(({ rows }) => rows[0]);
  }

  /**
   * Update fields in existing item
   * @param id
   * @param patch
   */
  update(id: string | number, patch: P) {
    return this.context.db
      .query(
        ...update(this.collection, {
          set: this.prepare(patch),
          where: { id },
          returning: "*",
        })
      )
      .then(({ rows }) => rows[0]);
  }

  // /**
  //  * Upsert  item
  //  * @param item
  //  */
  upsert({ id, ...item }: I & { id: string | number }) {
    if (!id) throw new HTTPUserInputError("id", "ID is required");
    return this.context.db
      .query(
        ...insertInto(this.collection, this.prepare({ id, ...item }), {
          onConflict: {
            update: {
              set: this.prepare(item),
            },
          },
          returning: "*",
        })
      )
      .then(({ rows }) => rows[0]);
  }

  /**
   * Delete item by id
   * @param id
   */
  delete(id: string) {
    return this.context.db
      .query(...deleteFrom(this.collection, { where: { id } }))
      .then(({ rowCount }) => ({ deleted: Boolean(rowCount) }));
  }

  /**
   * Return list of items, providing `offset` and `limit`.
   * Offset is a cursor, returned during a previous call in `nextOffset`
   * @param params
   */
  list(
    params: { limit?: number; offset?: number } = {}
  ): Promise<{ items: T[]; nextOffset: number | null; count: number }> {
    const limit = params.limit ?? 20;
    const offset = params.offset ?? 0;
    const [countQuery] = selectFrom(this.collection, {
      columns: "COUNT(*) as count",
    });
    return this.context.db
      .query(
        ...selectFrom(`${this.collection} as t,(${countQuery}) as c`, {
          offset,
          limit,
        })
      )
      .then((result) => {
        const count = result.rows[0]?.count ?? 0;
        const items = result.rows.map((item) => {
          delete item.count;
          return item;
        });
        const next = Number(limit) + Number(offset);
        return {
          items,
          nextOffset: next >= count ? null : next,
          count,
        };
      });
  }
}
