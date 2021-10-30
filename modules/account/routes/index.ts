import { createAccount, getAccount, listAccounts } from "./accounts";
import { getCurrentAccount, login, logout } from "./login";
import { checkAccountAccess } from "./permissions";

export default {
  "/account": {
    POST: createAccount,
    GET: listAccounts,
  },
  "/account/:id": {
    GET: getAccount,
    // DELETE: deleteAccount,
    // PUT: updateAccount,
  },
  "/account/login": {
    GET: getCurrentAccount,
    POST: login,
    DELETE: logout,
  },
  "/account/access/:scope": checkAccountAccess,
  "/account/access/:scope/:id": checkAccountAccess,
};
