import layout from "dashboard/layout";
import createRouter from "utils/router";
import Login from "./Login";
import Page from "./Page";

export const initial = createRouter({
  "/login": Login,
  "/*": Login,
});

export const authorized = createRouter({
  "/": () => {
    const { main } = layout(document.body);
    main.innerHTML = "<h1>Home</h1><p>Welcome!</p>";
  },
  "/pages/:id": Page,
});
