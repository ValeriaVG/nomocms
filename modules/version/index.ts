import info from "../../package.json";
export default {
  routes: {
    "/version": () => {
      return {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
        body: { version: info.version },
      };
    },
  },
};
