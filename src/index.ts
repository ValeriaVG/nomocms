/* istanbul ignore file */
import createServer from "./server";
const port = process.env.PORT || 8080;

createServer()
  .then((server) =>
    server.listen(port, () => {
      console.info(`Server listening on http://localhost:${port}`);
    })
  )
  .catch((error) => {
    console.error(error);
    process.exit(-1);
  });
