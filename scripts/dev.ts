import { fusebox } from "fuse-box";
import { dashboard } from "./fuse.config";

const fuse = fusebox({
  ...dashboard,
  devServer: true,
});
fuse.runDev();
