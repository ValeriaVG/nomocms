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
    vendor: "vendor.$name.$hash.js",
    styles: "styles/styles.$hash.css",
  },
});
