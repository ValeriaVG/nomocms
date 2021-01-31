import { fusebox } from "fuse-box";
import config from "./fuse.config";

fusebox({
  ...config,
  devServer: true,
}).runDev();
