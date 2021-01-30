import { HTTPUserInputError } from "core/errors";
import {
  ColumnDefinition,
  deleteFrom,
  insertInto,
  Query,
  selectFrom,
  update,
} from "core/sql";
import { ExcludeReserved, SimpleType } from "core/types";
import { Client } from "pg";

import { CRUDLDataSource } from "./types";

/**
 * Primary CRUD interface for generic entities
 * stored in PostgreSQL table
 */
export default abstract class SQLDataSource<
  T extends Record<string, SimpleType>,
  I extends Record<string, SimpleType> = Partial<T>,
  P extends Record<string, SimpleType> = Partial<I>
> extends CRUDLDataSource<T, I, P> {
  /**
   * Table name
   */
  readonly collection: string;

  /**
   * PostgreSQL table schema
   */
  readonly schema: Record<string, ColumnDefinition>;

  /**
   * Requires context with db
   * @param context
   */
  constructor(protected context: { db: Client }) {
    super(context);
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
   * Retreive item by id
   * @param id
   */
  get(id: string) {
    return this.context.db
      .query(...selectFrom(this.collection, { where: { id } }))
      .then(({ rows }) => rows[0]);
  }

  /**
   * Create new item
   * @param input
   */
  create(input: I) {
    return this.context.db
      .query(...insertInto(this.collection, input, { returning: "*" }))
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
          set: patch,
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
  // upsert({ id, ...item }: I & { id: string }) {
  //   if (!id) throw new HTTPUserInputError("id", "ID is required");
  //   return this.context.db
  //     .query(
  //       ...insertInto(
  //         this.collection,
  //         { id, ...item },
  //         {
  //           onConflict: {
  //             update: {
  //               set: item,
  //             },
  //           },
  //           returning: "*",
  //         }
  //       )
  //     )
  //     .then(({ rows }) => rows[0]);
  // }

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
    return this.context.db
      .query(
        ...selectFrom(this.collection, {
          offset,
          limit,
          columns: ["COUNT(*) as count", "*"],
        })
      )
      .then((result) => {
        const count = result.rows[0]["count"];
        const items = result.rows.map((item) => {
          delete item.total;
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
