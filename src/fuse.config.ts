import path from "path";
import { dashboard } from "config";
import { IPublicConfig } from "fuse-box/config/IConfig";

export default {
  entry: ["./dashboard/index.ts"],
  target: "browser",
  webIndex: {
    publicPath: dashboard.path,
  },
  alias: {
    "^react$": "preact/compat",
    "^react-dom$": "preact/compat",
  },
} as IPublicConfig;
