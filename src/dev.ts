import { dashboard } from "config";
import { fusebox } from "fuse-box";
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
  .then((result) => {
    // TODO: fix this abomination
    result.onComplete((r) => {
      const setupServer = require("./server").default;
      const port = 8080;
      setupServer().then((server) =>
        server.listen(port, () => {
          console.log(`http://localhost:${port}/`);
        })
      );
    });
  })
  .catch(console.error);
