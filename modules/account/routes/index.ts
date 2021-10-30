import {
  createAccount,
  deleteAccount,
  getAccount,
  listAccounts,
  updateAccount,
} from "./accounts";
import { getCurrentAccount, login, logout } from "./login";
import { checkAccountAccess } from "./permissions";

export default {
  "/accounts": listAccounts,
  "/account": {
    POST: createAccount,
    GET: getCurrentAccount,
    PATCH: updateAccount,
    DELETE: deleteAccount,
  },
  "/account/:id": {
    GET: getAccount,
    DELETE: deleteAccount,
    PATCH: updateAccount,
  },
  "/account/login": {
    POST: login,
    DELETE: logout,
  },
  "/account/access/:scope": checkAccountAccess,
  "/account/access/:scope/:id": checkAccountAccess,
};
