import { SQLDataSource } from "core/DataSource";
import { ColumnDefinition, deleteFrom } from "core/sql";

type UserToken = {
  id: string;
  user_id: number;
  created: Date;
  expires: Date;
  ip?: string;
};
export default class Tokens extends SQLDataSource<UserToken> {
  readonly collection = "tokens";
  readonly ttl = 30 * 24 * 60 * 60; // 30 days

  readonly schema: Record<keyof UserToken, ColumnDefinition> = {
    id: { type: "varchar", length: 255, primaryKey: true },
    user_id: { type: "int" },
    created: { type: "timestamp", default: "NOW()" },
    expires: {
      type: "timestamp",
      default: `NOW() + '${this.ttl} seconds'::interval`,
    },
    ip: { type: "inet", nullable: true },
  };
  /**
   * Save token for user with `id` and `ip`
   * @param input
   */
  save({
    token,
    user_id,
    ip,
  }: {
    token: string;
    user_id: number;
    ip?: string;
  }) {
    return this.upsert({
      id: token,
      user_id,
      ip,
      expires: new Date(Date.now() + this.ttl * 1000),
      created: new Date(Date.now()),
    });
  }

  /**
   * Delete provided token for user, a.k.a. logout
   * @param token
   */
  deleteOne({ token, user_id }: { token: string; user_id: number }) {
    return this.context.db
      .query(...deleteFrom(this.collection, { where: { id: token, user_id } }))
      .then(({ rowCount }) => ({ deleted: Boolean(rowCount) }));
  }

  /**
   * Delete all tokens from user, a.k.a logout from all devices
   * @param id
   */
  deleteAll(user_id: number) {
    return this.context.db
      .query(...deleteFrom(this.collection, { where: { user_id } }))
      .then(({ rowCount }) => ({ deleted: rowCount }));
  }
}
