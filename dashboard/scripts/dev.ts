import path from "path";
import { readFile, mkdir, writeFile } from "fs/promises";
import { serve } from "esbuild";
import * as config from "./config";

export const getHTML = async (props: { version?: string } = {}) => {
  const template = await readFile(config.indexHTML);
  return template.toString().replace("<version>", props.version || "");
};

const startDevServer = async () => {
  // Make build dir
  const tmpDir = path.resolve(__dirname, ".dev");
  try {
    await mkdir(tmpDir);
  } catch (err) {
    if (err.code !== "EEXIST") {
      console.error(err);
      process.exit(-1);
    }
  }
  const html = await getHTML({ version: "dev" });
  await writeFile(path.join(tmpDir, "index.html"), html);
  const devServer = await serve(
    {
      port: 3000,
      servedir: tmpDir,
    },
    {
      ...config.esbuild,
      write: false,
    }
  );
  console.log(`Dev server is listening on http://localhost:${devServer.port}`);
  process.on("SIGINT", devServer.stop);
  process.on("SIGTERM", devServer.stop);
  process.on("SIGABRT", devServer.stop);
};
if (!module.parent) {
  startDevServer();
}
