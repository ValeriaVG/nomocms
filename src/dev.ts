import { dashboard } from "config";
import { fusebox } from "fuse-box";
import server from "./server";

const fuse = fusebox({
  entry: "./dashboard/index.ts",
  target: "browser",
  webIndex: {
    publicPath: dashboard.path,
  },
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
