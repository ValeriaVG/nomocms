import { build } from "esbuild";
import path from "path";
import { writeFile } from "fs/promises";
import { exec } from "child_process";

import * as config from "./config";
import { getHTML } from "./dev";

const run = async () => {
  const version = await new Promise<string>((ok, fail) =>
    exec("git rev-parse --short HEAD", (err, stdout) => {
      if (err) return fail(err);
      return ok(stdout.trim());
    })
  ).catch((_) => "");

  const result = await build({
    ...config.esbuild,
    minify: true,
    write: true,
    outdir: config.outdir,
  });
  result.errors.forEach((err) => console.error(err));
  result.warnings.forEach((err) => console.warn(err));
  const indexHTML = await getHTML({ version });
  await writeFile(path.resolve(config.outdir, "index.html"), indexHTML);
};

run().catch((err) => {
  console.error(`Failed to build dashboard`, err);
  process.exit(1);
});
