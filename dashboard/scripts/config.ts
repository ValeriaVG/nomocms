import path from "path";
import { BuildOptions } from "esbuild";
import sveltePlugin from "lib/sveltePlugin";

export const outdir = "./build";

export const esbuild: BuildOptions = {
  entryPoints: {
    index: "src/index.ts",
  },
  bundle: true,
  loader: {
    ".png": "file",
    ".svg": "file",
    ".jpeg": "file",
    ".jpg": "file",
    ".ttf": "file",
    ".css": "file",
  },
  plugins: [sveltePlugin],
  define: {
    "process.env.API_URL": JSON.stringify(
      process.env.API_URL || "http://localhost:3030"
    ),
  },
};

export const indexHTML = path.resolve(__dirname, "..", "index.html");
