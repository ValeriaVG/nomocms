import info from "../../package.json";
export default {
  routes: {
    "/version": () => {
      return {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ version: info.version }),
      };
    },
  },
};
