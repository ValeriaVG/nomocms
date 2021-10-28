import { createAccount } from "./accounts";
import { login, logout } from "./login";

export default {
  "/account": {
    POST: createAccount,
    //   GET: listAccounts,
  },
  // "/account/:id": {
  //   GET: getAccount,
  //   DELETE: deleteAccount,
  //   PUT: updateAccount,
  // },
  "/login": {
    //GET: getCurrentAccount,
    POST: login,
    DELETE: logout,
  },
};
