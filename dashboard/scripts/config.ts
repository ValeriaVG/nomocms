import esbuildSvelte from "esbuild-svelte";
import sveltePreprocess from "svelte-preprocess";
import path from "path";
import { BuildOptions } from "esbuild";

export const outdir = "./build";

export const esbuild: BuildOptions = {
  entryPoints: ["src/index.ts"],
  inject: ["./shim.js"],
  bundle: true,
  loader: { ".png": "file", ".svg": "file", ".jpeg": "file", ".jpg": "file" },
  plugins: [
    esbuildSvelte({
      preprocess: sveltePreprocess({
        typescript: {
          tsconfigFile: path.resolve(__dirname, "../tsconfig.json"),
        },
      }),
    }),
  ],
};

export const indexHTML = path.resolve(__dirname, "..", "index.liquid");
