import * as ts from "typescript";
import path from "path";
import fs from "fs";
import baseOptions from "../typescript.config";

const rootDir = path.resolve(__dirname, "..", "..", "src");
const amd = path.resolve(__dirname, "..", "utils", "amd.node.js");

const outDir = path.resolve(rootDir, "..", ".server");
const outFile = path.resolve(outDir, "index.js");

const fileName = "index.ts";

const options: ts.CompilerOptions = {
  ...baseOptions,
  target: ts.ScriptTarget.ESNext,
  outFile,
  rootDir: undefined,
  rootDirs: [rootDir, path.resolve(__dirname, "..", "utils")],
};
const program = ts.createProgram(
  [amd, path.resolve(rootDir, fileName)],
  options
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
  console.log("Built server");
  // Adding require
  fs.writeFileSync(outFile, `\ndefine.require("src/index");`, {
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
