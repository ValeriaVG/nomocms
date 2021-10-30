import { compile } from "svelte/compiler";
import { build } from "esbuild";
import vm from "vm";

export default async function compileContent(source: string) {
  const resultSSR = await compile(source, {
    enableSourcemap: false,
    generate: "ssr",
    sveltePath: "svelte",
    format: "cjs",
    hydratable: true,
  });
  const ctx = {
    require(path) {
      if (path.startsWith("svelte")) return require(path);
      throw Error("Only Svelte imports are allowed");
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
      resolveDir: __dirname,
    },
  });
  const bundle = files[0];
  return { html, css, head, js: Buffer.from(bundle.contents).toString() };
}
