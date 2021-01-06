import { DataSource } from "core/DataSource";
import { HTTPUserInputError } from "core/errors";
import { Redis } from "ioredis";

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
  user: string;
  scope?: string;
};

export type UserRoleInput = PermissionsInput & {
  permissions: number;
};

export default class Permissions extends DataSource {
  readonly collection = "permissions";

  constructor(protected context: { redis: Redis }) {
    super(context);
    this.context.redis.defineCommand("scanpermissions", {
      numberOfKeys: 1,
      lua: `
      local permissions = redis.call('SCAN', 0 ,'MATCH',KEYS[1],unpack(ARGV));
      local result = {};
      for k,v in ipairs(permissions[2]) do
        local value = redis.call('GET',v);
        result[k]={v,value};
      end
      return result
      `,
    });
  }

  private key({ user, scope }: PermissionsInput) {
    if (typeof user !== "string")
      throw new HTTPUserInputError("User ID must be a string");
    if (!user) throw new HTTPUserInputError("User ID should be provided");

    let key = this.collection;
    key += "::";

    if (scope && typeof scope !== "string")
      throw new HTTPUserInputError("Scope must be a string");
    key += scope || "global";
    key += "::";

    key += user;
    return key;
  }

  /**
   * Check if user with provided id
   * has certain permissions
   * to access specified scope
   * or if user has global permissions
   * if scope is not specified
   * @param params
   */
  check({ permissions, ...params }: UserRoleInput) {
    return this.get(params).then((role) => {
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
  get({ user, scope }: { user: string; scope?: string }) {
    if (!scope)
      return this.context.redis
        .get(this.key({ user }))
        .then((p) => (p ? parseInt(p) : 0));
    return this.context.redis
      .multi()
      .get(this.key({ user }))
      .get(this.key({ user, scope }))
      .exec()
      .then(([[_, g], [__, s]]) => {
        const globalPermissions = g ? parseInt(g) : 0;
        const scopedPermissions = s ? parseInt(s) : 0;
        return globalPermissions | scopedPermissions;
      });
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
  set({ user, permissions, scope }: UserRoleInput) {
    return this.context.redis.set(this.key({ user, scope }), permissions);
  }

  /**
   * Revoke all permissions from user
   * from a certain scope
   * or global permissions if return is not specified
   * @param params
   */
  delete(params: PermissionsInput) {
    return this.context.redis.del(this.key(params));
  }

  private re = new RegExp("permissions::(.+)::(.+)");
  /**
   * Returns a map of scope-permission pairs
   * @param params
   */
  map(user: string, scope?: string): Promise<Map<string | "global", number>> {
    return this.context.redis["scanpermissions"](
      this.key({ user, scope: scope || "*" })
    ).then((permissions) => {
      const map = new Map<string, number>();
      for (let permission of permissions) {
        const scope = permission[0].replace(this.re, "$1");
        const value = parseInt(permission[1]);
        map.set(scope, value);
      }
      return map;
    });
  }

  /**
   * List users, that have permissions
   * in certain or global scope
   * @param params
   */
  users(scope?: string) {
    return this.context.redis["scanpermissions"](
      this.key({ user: "*", scope: scope || "*" })
    ).then((permissions) => {
      const result = [];

      for (let permission of permissions) {
        const scope = permission[0].replace(this.re, "$1");
        const user = permission[0].replace(this.re, "$2");
        const value = parseInt(permission[1]);
        result.push({ scope, user, value });
      }
      return result;
    });
  }
}
