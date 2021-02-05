import fs from "fs";
import path from "path";
import * as ts from "typescript";
import { JSDOM } from "jsdom";

const rootDir = path.resolve(__dirname, "..", "src");
const workDir = path.resolve(__dirname, "..", "src", "dashboard");
const outDir = path.resolve(__dirname, "..", ".dashboard");
const outFile = path.resolve(outDir, "index.js");

console.log("Preparing output directory", outDir);
if (fs.existsSync(outDir)) fs.rmdirSync(outDir, { recursive: true });
fs.mkdirSync(outDir);

const options: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES5,
  outFile,
  module: ts.ModuleKind.AMD,
  sourceMap: false,
  allowJs: true,
  moduleResolution: ts.ModuleResolutionKind.NodeJs,
  allowSyntheticDefaultImports: true,
  esModuleInterop: true,
  noImplicitAny: false,
  resolveJsonModule: true,
  rootDir: rootDir,
  outDir,
  jsx: ts.JsxEmit.React,
  baseUrl: rootDir,
  noEmitOnError: true,
  skipLibCheck: true,
};
const program = ts.createProgram([path.resolve(workDir, "index.ts")], options);

const emitResult = program.emit();

const allDiagnostics = ts
  .getPreEmitDiagnostics(program)
  .concat(emitResult.diagnostics);

allDiagnostics.forEach((diagnostic) => {
  if (diagnostic.file) {
    let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
      diagnostic.start!
    );
    let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
    console.log(
      `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`
    );
  } else {
    console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
  }
});

const exitCode = emitResult.emitSkipped ? 1 : 0;
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
  document.head.appendChild(script);

  fs.writeFileSync(path.resolve(outDir, "index.html"), dom.serialize());
  console.log("Done");
}
process.exit(exitCode);
