import { dashboard } from "config";
import { fusebox } from "fuse-box";
import config from "./fuse.config";
import compile from "./tools/compile";

const fuse = fusebox(config);

const compileServer = () => compile("index.ts");

fuse
  .runProd({
    bundles: {
      distRoot: dashboard.dist,
    },
  })
  .then(compileServer);
