import { compile } from "svelte/compiler";
import { build } from "esbuild";
import vm from "vm";
import path from "path";
import fs from "fs/promises";
import sveltePlugin from "lib/sveltePlugin";

const modulesDir = path.resolve(__dirname, "..", "..");

export default async function compileContent(source: string) {
  const resultSSR = await compile(source, {
    enableSourcemap: false,
    generate: "ssr",
    sveltePath: "svelte",
    format: "cjs",
    hydratable: true,
    immutable: true,
  });
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
  } = ctx.exports.default.render();

  const domResult = await compile(source, {
    enableSourcemap: false,
    generate: "dom",
    sveltePath: "svelte",
    hydratable: true,
    immutable: true,
  });

  const { outputFiles: files } = await build({
    write: false,
    bundle: true,
    outfile: "bundle.js",
    splitting: false,
    minify: true,
    stdin: {
      contents:
        domResult.js.code +
        `\n;new Component({target:document.body,hydrate:true})`,
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
  const bundle = files[0];
  return { html, css, head, js: Buffer.from(bundle.contents).toString() };
}
