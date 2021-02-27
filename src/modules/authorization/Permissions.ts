import {
  ColumnDefinition,
  SQLDataSource,
  deleteFrom,
  insertInto,
} from "core/sql";

/**
 * User role includes possible permissions
 * in the following order:
 *
 * - Delete
 * - Update
 * - Create
 * - List
 * - Read
 */
export enum Permission {
  all = 0b11111,
  delete = 0b10000,
  update = 0b01000,
  create = 0b00100,
  list = 0b00010,
  read = 0b00001,
  view = 0b00011,
}

export type PermissionsInput = {
  user_id: number;
  scope?: string;
};

export type UserPermissions = PermissionsInput & {
  permissions: number;
};

export default class Permissions extends SQLDataSource<
  UserPermissions,
  UserPermissions
> {
  readonly collection = "permissions";

  readonly schema: Record<keyof UserPermissions, ColumnDefinition> = {
    user_id: { type: "int" },
    permissions: { type: "smallint" },
    scope: { type: "varchar", length: 50, default: "'global'" },
  };

  readonly primaryKey = ["user_id", "scope"] as Array<keyof UserPermissions>;

  /**
   * Check if user with provided id
   * has certain permissions
   * to access specified scope
   * or if user has global permissions
   * if scope is not specified
   * @param params
   */
  check({ permissions, user_id, scope }: UserPermissions) {
    return this.getPermissions({ user_id, scope }).then((role) => {
      return Boolean(role & permissions);
    });
  }

  /**
   *  Get permission for user with provided id
   * to access specified scope
   * or global permissions
   * if scope is not specified
   * @param param0
   */
  getPermissions({ user_id, scope }: { user_id: number; scope?: string }) {
    return super
      .findOne({
        where: [
          { user_id, scope: "global" },
          scope && { user_id, scope },
        ].filter(Boolean),
        orderBy: { permissions: "DESC" },
      })
      .then((row) => row?.permissions ?? 0);
  }

  /**
   * Grant user with provided id
   * certain permissions
   * to access specified scope.
   * If scope is not specified,
   * user will be granted these
   * permissions to all scopes
   * @param param
   */
  set(input: UserPermissions) {
    return this.context.db
      .query(
        ...insertInto(this.collection, input, {
          onConflict: {
            constraint: this.primaryKey,
            update: {
              set: input,
            },
          },
          returning: "*",
        })
      )
      .then(({ rows }) => rows[0]);
  }

  /**
   * Revoke all permissions from user
   * from a certain scope
   * or global permissions if return is not specified
   * @param params
   */
  deleteAll(params: PermissionsInput) {
    return this.context.db
      .query(...deleteFrom(this.collection, { where: params }))
      .then(({ rowCount }) => ({
        deleted: rowCount,
      }));
  }

  /**
   * Returns a map of scope-permission pairs
   * @param params
   */
  map(user_id: number): Promise<Map<string | "global", number>> {
    return this.find({ where: { user_id } }).then((rows) =>
      rows.reduce((a, c) => {
        a.set(c.scope || "global", c.permissions);
        return a;
      }, new Map())
    );
  }
}
