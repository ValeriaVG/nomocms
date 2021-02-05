import fs from "fs";
import path from "path";
import * as ts from "typescript";
import { JSDOM } from "jsdom";
import baseOptions from "./typescript.config";
import makeDevServer, { MemoryFile } from "./utils/devServer";

const workDir = path.resolve(__dirname, "..", "src", "dashboard");
const outDir = "/";
const outFile = path.resolve(outDir, "index.js");
const amd = path.resolve(__dirname, ".", "utils", "amd.browser.js");

const options: ts.CompilerOptions = {
  ...baseOptions,
  target: ts.ScriptTarget.ES5,
  outFile,
};

const files = new Map<string, MemoryFile>();

const compile = () => {
  const host: ts.CompilerHost = ts.createCompilerHost(options);
  host.writeFile = (fileName: string, contents: string) => {
    files.set(fileName, {
      contents,
      size: contents.length,
      type: "text/javascript",
    });
  };

  const program = ts.createProgram(
    [amd, path.resolve(workDir, "index.ts")],
    options,
    host
  );

  const emitResult = program.emit();

  const allDiagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);

  allDiagnostics.forEach((diagnostic) => {
    if (diagnostic.file) {
      let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
        diagnostic.start!
      );
      let message = ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        "\n"
      );
      console.log(
        `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`
      );
    } else {
      console.log(
        ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")
      );
    }
  });

  if (!emitResult.emitSkipped) {
    console.log("Built dashboard");

    console.log("Loading index.html");
    const indexHTML = fs
      .readFileSync(path.resolve(workDir, "index.html"))
      .toString();
    const dom = new JSDOM(indexHTML);
    const document = dom.window.document;
    const script = document.createElement("script");
    script.src = "index.js";
    document.body.appendChild(script);

    const html = dom.serialize();
    files.set("/index.html", {
      contents: html,
      size: html.length,
      type: "text/html",
    });
  }
};

compile();
const watcher = fs.watch(workDir);

watcher.on("change", () => {
  console.log("Change detected, recompiling");
  compile();
});

const server = makeDevServer(files);
const port = 3000;
server.listen(port, () => {
  console.log(`DevServer listening on http://localhost:${port}`);
});
