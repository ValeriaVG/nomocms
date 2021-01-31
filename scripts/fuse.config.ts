import path from "path";
import { IPublicConfig } from "fuse-box/config/IConfig";
import { publicPath } from "dashboard/config";

export default {
  entry: [path.resolve(__dirname, "../src/dashboard/index.ts")],
  target: "browser",
  webIndex: {
    publicPath,
  },
  alias: {
    "^react$": "preact/compat",
    "^react-dom$": "preact/compat",
  },
} as IPublicConfig;
