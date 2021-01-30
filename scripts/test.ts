import Mocha, { MochaOptions } from "mocha";
import path from "path";
import fs from "fs";
import { promisify } from "util";

const readDir = promisify(fs.readdir);
const fileStats = promisify(fs.stat);

process.env.NODE_ENV = "test";

const rootDir = path.resolve(__dirname, "..", "src");

export const getTests = async (dir: string): Promise<string[]> => {
  const files = await readDir(dir);
  const tests = [];
  for (const file of files) {
    const filePath = path.resolve(dir, file);
    const stats = await fileStats(filePath);
    if (stats.isDirectory()) {
      (await getTests(filePath)).forEach((test) => tests.push(test));
    } else if (/(spec|test).tsx?$/.test(file)) tests.push(filePath);
  }
  return tests;
};

export const runTests = async (options: MochaOptions = {}) => {
  const mocha = new Mocha(options);
  mocha.files = await getTests(rootDir);
  mocha.run((failures) => (process.exitCode = failures ? 1 : 0));
};

runTests();
