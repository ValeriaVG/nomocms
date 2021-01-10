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
      const server = require("./server");
      const port = 8080;
      server.default.listen(port, () => {
        console.log(`http://localhost:${port}/`);
      });
    });
  })
  .catch(console.error);
