import migrations from "./migrations";

export default {
  migrations,
  routes: {
    "/": () => ({
      status: 200,
      body: `NOMOCMS`,
    }),
  },
};
