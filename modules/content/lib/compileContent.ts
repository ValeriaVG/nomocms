import { compile } from "svelte/compiler";
import type { CompileOptions } from "svelte/types/compiler/interfaces";
import { build } from "esbuild";
import vm from "vm";
import path from "path";
import fs from "fs/promises";
import sveltePlugin from "lib/sveltePlugin";

const modulesDir = path.resolve(__dirname, "..", "..");

export default async function compileContent(
  source: string,
  parameters: Record<string, any> = {}
) {
  const resultSSR = await compile(source, configSSR);
  const ctx = {
    require(path) {
      require("svelte/register");
      if (path.startsWith("svelte")) return require(path);
      if (path.startsWith("$")) return require("modules/" + path.slice(1));
      throw new Error(`Only svelte and modules paths can be imported`);
    },
    exports: {} as Record<string, any>,
  };

  vm.runInNewContext(resultSSR.js.code, ctx);
  const {
    html,
    css: { code: css },
    head,
  } = ctx.exports.default.render(parameters);

  const domResult = await compile(source, configDOM);

  const { outputFiles: files } = await build(
    esBuildConfig(domResult.js.code, parameters)
  );
  const bundle = files[0];
  return { html, css, head, js: Buffer.from(bundle.contents).toString() };
}

const configDOM: CompileOptions = {
  enableSourcemap: false,
  generate: "dom",
  sveltePath: "svelte",
  hydratable: true,
  immutable: true,
};

const configSSR: CompileOptions = {
  ...configDOM,
  generate: "ssr",
  format: "cjs",
};

const esBuildConfig = (code: string, parameters: Record<string, any>) => ({
  write: false,
  bundle: true,
  outfile: "bundle.js",
  splitting: false,
  minify: true,
  stdin: {
    contents:
      code +
      `\n;new Component({target:document.body,hydrate:true,props:${JSON.stringify(
        parameters || {}
      )}})`,
    resolveDir: modulesDir,
  },
  plugins: [
    {
      name: "module-resolver",
      setup(build) {
        build.onResolve({ filter: /\$/ }, async (args) => {
          let name = args.path.slice(1);
          for (const ext of ["", ".ts", ".js", ".svelte"]) {
            const stats = await fs
              .stat(path.resolve(modulesDir, name + ext))
              .catch((_) => undefined);
            if (stats?.isFile()) {
              name += ext;
              break;
            }
          }
          return {
            path: path.resolve(modulesDir, name),
          };
        });
      },
    },
    sveltePlugin,
  ],
});
