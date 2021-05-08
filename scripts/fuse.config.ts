import path from "path";
import { pluginSass } from "./utils/pluginSass";
import pluginMonacoEditorWorkers from "./utils/pluginMonacoEditorWorkers";
export const dashboard = {
  entry: path.resolve(__dirname, "../src/dashboard/index.ts"),
  target: "browser" as const,
  webIndex: {
    template: path.resolve(__dirname, "../src/dashboard/index.html"),
    publicPath: process.env.PUBLIC_URL || "/",
  },
  plugins: [
    pluginSass("*.scss", {
      asModule: { scopeBehaviour: "local" },
    }),

    pluginMonacoEditorWorkers(),
  ],
  env: {
    PUBLIC_URL: process.env.PUBLIC_URL,
    CMS_API_URL: process.env.CMS_API_URL,
  },

  cache: { root: path.join(__dirname, ".cache/dashboard") },
} as any;

export const server = {
  entry: path.resolve(__dirname, "../src/index.ts"),
  target: "server" as const,
  cache: { root: path.join(__dirname, ".cache/server") },
  webIndex: false,
};
