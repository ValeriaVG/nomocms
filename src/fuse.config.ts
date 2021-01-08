import { dashboard } from "config";
import { IPublicConfig } from "fuse-box/config/IConfig";

export default {
  entry: ["./dashboard/index.ts"],
  target: "browser",
  webIndex: {
    publicPath: dashboard.path,
    template: "./dashboard/index.html",
  },
  alias: {
    "^react$": "preact/compat",
    "^react-dom$": "preact/compat",
  },
} as IPublicConfig;
