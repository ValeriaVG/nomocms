#!/usr/bin/env ts-node
import fs from "fs/promises";
import path from "path";
import { prettify, Test } from "tiny-jest";
import { config } from "dotenv";

config({ path: path.resolve(__dirname, "../test.env") });

async function runTests(dir) {
  let passed = true;
  try {
    const files = await fs.readdir(dir);
    for (let file of files) {
      const filePath = path.join(dir, file);
      const stat = await fs.stat(filePath);
      if (stat.isDirectory()) {
        passed = await runTests(filePath);
      } else if (/\.(test|spec)\.ts$/.test(file)) {
        const mod = await import(filePath);
        const test = mod.test || mod.default || mod;
        if (test && test instanceof Test) {
          test.title && console.info(test.title);
          const res = await test.run();
          prettify(res);
          if (res.some(t => !t.passed))
            passed = false
        }
      }
    }
  } catch (err) {
    console.error(`Failed to read directory ${dir}`, err);
    passed = false;
  }
  return passed;
}
const [_, __, ...dirs] = process.argv;
const directories = dirs.length ? dirs : ["api", "modules", "dashboard", "lib"];
Promise.all(
  directories.map((dir) => runTests(path.resolve(__dirname, "..", dir)))
).then((results) => {
  if (!results.every(Boolean)) {
    console.error("Test failed")
    process.exit(-1);
  }
});
