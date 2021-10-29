import { createAccount, listAccounts } from "./accounts";
import { getCurrentAccount, login, logout } from "./login";

export default {
  "/account": {
    POST: createAccount,
    GET: listAccounts,
  },
  // "/account/:id": {
  //   GET: getAccount,
  //   DELETE: deleteAccount,
  //   PUT: updateAccount,
  // },
  "/account/login": {
    GET: getCurrentAccount,
    POST: login,
    DELETE: logout,
  },
};
