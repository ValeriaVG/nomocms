import createRouter from "utils/router";
import Login from "./Login";
import Page from "./Page";

export const initial = createRouter(
  {
    "/login": Login,
  },
  Login
);

export const authorized = createRouter({
  "/": Page,
  "/pages/:id": Page,
});
