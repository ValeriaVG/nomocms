import setupServer from "./server";

const port = 8080;
setupServer().then((server) =>
  server.listen(port, () => {
    console.log(`http://localhost:${port}/`);
  })
);
