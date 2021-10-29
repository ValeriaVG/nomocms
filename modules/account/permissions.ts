import { Pool } from "pg";
import { User } from "./types";

export enum Permission {
  all = 0b11111,
  delete = 0b10000,
  update = 0b01000,
  create = 0b00100,
  list = 0b00010,
  read = 0b00001,
  view = 0b00011,
}

export const checkPermission = async (
  db: Pool,
  {
    user,
    scope,
    permission,
  }: { user: User; scope: string; permission: Permission }
): Promise<boolean> => {
  if (user.isSuperUser) return true;
  const result = await db.query(
    `SELECT permissions FROM account_permissions WHERE account_id=$1 AND (scope=$2 OR scope='*')`,
    [user.id, scope]
  );
  if (!result.rowCount) return false;
  const [{ permissions }] = result.rows;
  return Boolean(permissions & permission);
};
