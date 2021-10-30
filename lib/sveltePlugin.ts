import * as svelte from "svelte/compiler";
import path from "path";
import fs from "fs/promises";

const sveltePlugin = {
  name: "svelte",
  setup(build) {
    build.onLoad({ filter: /\.svelte$/ }, async (args) => {
      // This converts a message in Svelte's format to esbuild's format
      const convertMessage = ({ message, start, end }: Record<string, any>) => {
        let location;
        if (start && end) {
          let lineText = source.split(/\r\n|\r|\n/g)[start.line - 1];
          let lineEnd = start.line === end.line ? end.column : lineText.length;
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
        const { js, warnings } = svelte.compile(source, { filename });
        const contents = js.code + `//# sourceMappingURL=` + js.map.toUrl();
        return { contents, warnings: warnings.map(convertMessage) };
      } catch (e) {
        return { errors: [convertMessage(e)] };
      }
    });
  },
};
export default sveltePlugin;
