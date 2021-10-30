import { RouteHandler } from "api/http/router";
import { ensureAccountPermission, Permission } from "../lib/permissions";

export const checkAccountAccess: RouteHandler = async (
  { db, req },
  { params: { scope } }
) => {
  await ensureAccountPermission({ db, req }, scope, Permission.view);
  return {
    status: 200,
    body: {
      access: "granted",
    },
  };
};
