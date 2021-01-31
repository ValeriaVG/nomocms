import { fusebox } from "fuse-box";
import path from "path";
import config from "../fuse.config";

const fuse = fusebox(config);

fuse.runProd({
  bundles: {
    distRoot: path.resolve(__dirname, "../../.dashboard"),
  },
});
