#!/usr/bin/env ts-node
import fs from "fs/promises";
import path from "path";
import { prettify, Test } from "tiny-jest";

async function runTests(dir) {
  try {
    const files = await fs.readdir(dir);
    for (let file of files) {
      const filePath = path.join(dir, file);
      const stat = await fs.stat(filePath);
      if (stat.isDirectory()) {
        await runTests(filePath);
      } else if (/\.(test|spec)\.ts$/.test(file)) {
        const mod = await import(filePath);
        const test = mod.test || mod.default || mod;
        if (test && test instanceof Test) {
          test.title && console.info(test.title);
          await test.run().then(prettify);
        }
      }
    }
  } catch (err) {
    console.error(`Failed to read directory ${dir}`, err);
  }
}

const directories = ["../site", "../modules", "../cms"];
Promise.all(directories.map((dir) => runTests(path.join(__dirname, dir))));
