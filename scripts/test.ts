import Mocha, { MochaOptions } from "mocha";
import path from "path";
import fs from "fs";
import { promisify } from "util";

const readDir = promisify(fs.readdir);
const fileStats = promisify(fs.stat);

process.env.NODE_ENV = "test";

const rootDir = path.resolve(__dirname, "..", "src");

const filter = process.argv[2];
const testRegExp = new RegExp(`${filter ?? ""}.(spec|test).tsx?$`, "i");
if (filter) console.info("Running tests matching", testRegExp);

export const getTests = async (dir: string): Promise<string[]> => {
  const files = await readDir(dir);
  const tests = [];
  for (const file of files) {
    const filePath = path.resolve(dir, file);
    const stats = await fileStats(filePath);
    if (stats.isDirectory()) {
      (await getTests(filePath)).forEach((test) => tests.push(test));
    } else if (testRegExp.test(filePath)) tests.push(filePath);
  }
  return tests;
};

export const runTests = async (options: MochaOptions = {}) => {
  const mocha = new Mocha(options);
  //@ts-ignore
  mocha.lazyLoadFiles(true);
  mocha.files = await getTests(rootDir);
  mocha
    .loadFilesAsync()
    .then(() => mocha.run((failures) => (process.exitCode = failures ? 1 : 0)))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
};

const options: MochaOptions = {
  checkLeaks: true,
};
runTests(options);
