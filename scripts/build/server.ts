import { fusebox } from "fuse-box";
import path from "path";
import { server } from "../fuse.config";

const fuse = fusebox({
  ...server,
  devServer: false,
});

fuse.runProd({
  bundles: {
    distRoot: path.resolve(__dirname, "../../.server"),
    app: "index.js",
  },
});
