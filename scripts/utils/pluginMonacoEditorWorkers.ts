import { fusebox } from "fuse-box";
import { BundleType } from "fuse-box/bundle/bundle";
import { Context } from "fuse-box/core/context";
import { existsSync } from "fs";
import path from "path";

const workers = {
  "editor.worker": "editor/editor.worker.js",
  "json.worker": "language/json/json.worker.js",
  "css.worker": "language/css/css.worker.js",
  "html.worker": "language/html/html.worker.js",
  "ts.worker": "language/typescript/ts.worker.js",
};
const resolveMonaco = (filename: string) =>
  path.resolve(
    __dirname,
    "../..",
    "node_modules/monaco-editor/esm/vs",
    filename
  );

export default function pluginMonacoEditorWorkers(...options: any) {
  return (ctx: Context) => {
    const publicPath = ctx.config.webIndex.publicPath || "/";

    const getWorkerPath = (worker: keyof typeof workers) =>
      publicPath + "workers/" + worker + ".js";
    const monacoEnvironment = `
      window.MonacoEnvironment = {
        getWorkerUrl: function (moduleId, label) {
          if (label === 'json') {
            return '${getWorkerPath("json.worker")}';
          }
          if (label === 'css' || label === 'scss' || label === 'less') {
            return '${getWorkerPath("css.worker")}';
          }
          if (label === 'html' || label === 'handlebars' || label === 'razor') {
            return '${getWorkerPath("html.worker")}';
          }
          if (label === 'typescript' || label === 'javascript') {
            return '${getWorkerPath("ts.worker")}';
          }
          return '${getWorkerPath("editor.worker")}';
        }
      }`;

    ctx.ict.on("before_bundle_write", (props) => {
      const bundle = props.bundle;
      if (bundle.type === BundleType.JS_APP) {
        if (!bundle.source.injection) bundle.source.injection = [];
        bundle.source.injection.push(monacoEnvironment);
      }
      return props;
    });
    ctx.ict.waitFor("before_bundle_write", async (props) => {
      // Fuse webworkers and add to upper build
      const distRoot = path.resolve(__dirname, ".workers");
      for (const [name, fileName] of Object.entries(workers)) {
        const app = name + ".js";
        const workerFile = path.join(distRoot, app);
        if (!existsSync(workerFile)) {
          const fuse = fusebox({
            entry: resolveMonaco(fileName),
            devServer: false,
            webIndex: false,
            target: "web-worker" as const,
            sourceMap: false,
          });
          await fuse.runProd({
            bundles: {
              app,
              distRoot,
            },
          });
        }

        ctx.taskManager.copyFile(
          workerFile,
          path.join(ctx.writer.outputDirectory, "workers", app)
        );
      }
      return props;
    });
  };
}
