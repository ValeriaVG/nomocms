import * as ts from "typescript";
import path from "path";

const rootDir = path.resolve(__dirname, "..", "src");
const options: ts.CompilerOptions = {
  module: ts.ModuleKind.AMD,
  sourceMap: false,
  allowJs: true,
  moduleResolution: ts.ModuleResolutionKind.NodeJs,
  allowSyntheticDefaultImports: true,
  esModuleInterop: true,
  noImplicitAny: false,
  resolveJsonModule: true,
  rootDirs: [
    path.resolve(__dirname, "..", "src"),
    path.resolve(__dirname, "utils"),
  ],
  baseUrl: rootDir,
  noEmitOnError: true,
  skipLibCheck: true,
};
export default options;
