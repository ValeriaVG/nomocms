import { fusebox } from "fuse-box";
import path from "path";
import { dashboard } from "./fuse.config";

const fuse = fusebox({
  ...dashboard,
  cache: { root: path.join(__dirname, ".cache/sink") },

  entry: path.resolve(__dirname, "../src/dashboard/sink/index.ts"),
  devServer: {
    httpServer: {
      port: 5555,
    },
    hmrServer: {
      port: 9999,
    },
  },
});
fuse.runDev({
  bundles: {
    distRoot: path.resolve(__dirname, "../../.sink"),
  },
});
