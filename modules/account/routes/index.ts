import { login } from "./login";

export default {
  // "/account": {
  //   POST: createAccount,
  //   GET: listAccounts,
  // },
  // "/account/:id": {
  //   GET: getAccount,
  //   DELETE: deleteAccount,
  //   PUT: updateAccount,
  // },
  "/login": {
    //GET: getCurrentAccount,
    POST: login,
    // DELETE: logout,
  },
};
