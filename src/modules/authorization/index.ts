export const resolvers = {
  login: {
    POST: ({ input: { email, password } }, { cookies }) => {
      console.log({ email, password, cookies });
      return { status: "OK" };
    },
  },
  access: {
    GET: (params) => {
      console.log("access", params);
      return { authorized: false };
    },
  },
  ping: {
    POST: (params) => {
      console.log("ping", params);
      return { message: "OK" };
    },
  },
};
