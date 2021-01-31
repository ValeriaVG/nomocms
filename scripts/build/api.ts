import * as ts from "typescript";
import path from "path";
import fs from "fs";

const rootDir = path.resolve(__dirname, "..");
const amd = path.resolve(__dirname, "amd.js");

const outDir = path.resolve(rootDir, "..", ".server");
const outFile = path.resolve(outDir, "index.js");

const fileName = "index.ts";

const options: ts.CompilerOptions = {
  target: ts.ScriptTarget.ESNext,
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
let program = ts.createProgram([amd, path.resolve(rootDir, fileName)], options);

let emitResult = program.emit();

let allDiagnostics = ts
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

let exitCode = emitResult.emitSkipped ? 1 : 0;
if (!emitResult.emitSkipped) {
  console.log("Built server");
  // Adding require
  fs.writeFileSync(outFile, `\ndefine.require("index");`, {
    flag: "a",
  });
  // Copy meta files for docker
  ["package.json", "yarn.lock"].forEach((name) => {
    fs.copyFileSync(
      path.resolve(rootDir, "..", name),
      path.resolve(outDir, name)
    );
  });
}

process.exit(exitCode);
