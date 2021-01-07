import { dashboard } from "config";
import { fusebox } from "fuse-box";

const fuse = fusebox({
  entry: "./dashboard/index.ts",
  target: "browser",
  webIndex: {
    publicPath: dashboard.path,
  },
});

fuse.runProd({
  bundles: {
    distRoot: dashboard.dist,
  },
});
