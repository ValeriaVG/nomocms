import { dashboard } from "config";
import { fusebox } from "fuse-box";
import config from "./fuse.config";

const fuse = fusebox(config);

fuse.runProd({
  bundles: {
    distRoot: dashboard.dist,
  },
});
