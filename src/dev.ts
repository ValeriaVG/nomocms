import { dashboard } from "config";
import { fusebox } from "fuse-box";
import server from "./server";
import config from "./fuse.config";

const fuse = fusebox({
  ...config,
  devServer: false,
});

fuse
  .runDev({
    bundles: {
      distRoot: dashboard.dist,
    },
  })
  .then(() => {
    const port = 8080;
    server.listen(port, () => {
      console.log(`http://localhost:${port}/`);
    });
  })
  .catch(console.error);
