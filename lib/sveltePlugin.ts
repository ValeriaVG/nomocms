import { compile, preprocess } from "svelte/compiler";
import { transformSync } from "esbuild";
import sveltePreprocess from "svelte-preprocess";
import path from "path";
import fs from "fs/promises";
export default {
  name: "svelte",
  setup(build) {
    build.onLoad({ filter: /\.svelte$/ }, async (args) => {
      // This converts a message in Svelte's format to esbuild's format
      const convertMessage = ({ message, start, end }: Record<string, any>) => {
        let location;
        if (start && end) {
          const lineText = source.split(/\r\n|\r|\n/g)[start.line - 1];
          const lineEnd =
            start.line === end.line ? end.column : lineText.length;
          location = {
            file: filename,
            line: start.line,
            column: start.column,
            length: lineEnd - start.column,
            lineText,
          };
        }
        return { text: message, location };
      };

      // Load the file from the file system
      const source = await fs.readFile(args.path, "utf8");
      const filename = path.relative(process.cwd(), args.path);

      // Convert Svelte syntax to JavaScript
      try {
        const result = await preprocess(
          source,
          sveltePreprocess({
            typescript({ content }) {
              const { code, map } = transformSync(content, {
                loader: "ts",
              });
              return { code, map };
            },
          }),
          {
            filename,
          }
        );
        const { js, warnings } = compile(result.code, { filename });
        const contents = js.code + `//# sourceMappingURL=` + js.map.toUrl();
        return { contents, warnings: warnings.map(convertMessage) };
      } catch (e) {
        return { errors: [convertMessage(e)] };
      }
    });
  },
};
