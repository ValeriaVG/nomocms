import esbuildSvelte from "esbuild-svelte";
import sveltePreprocess from "svelte-preprocess";
import path from "path";
import { BuildOptions } from "esbuild";

export const outdir = "./build";

export const esbuild: BuildOptions = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  loader: { ".png": "file", ".svg": "file", ".jpeg": "file", ".jpg": "file" },
  plugins: [
    esbuildSvelte({
      preprocess: sveltePreprocess(),
    }),
  ],
};

export const indexHTML = path.resolve(__dirname, "..", "index.liquid");
