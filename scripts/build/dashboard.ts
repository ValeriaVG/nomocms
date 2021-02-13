import { fusebox } from "fuse-box";
import path from "path";
import { dashboard } from "../fuse.config";

const fuse = fusebox({
  ...dashboard,
  devServer: false,
});

fuse.runProd({
  bundles: {
    distRoot: path.resolve(__dirname, "../../.dashboard"),
    styles: "styles/styles.$hash.css",
    codeSplitting: {
      path: "$name.$hash.js",
    },
  },
});
