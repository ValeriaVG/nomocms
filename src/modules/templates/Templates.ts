import { KeyDataSource } from "core/DataSource";
import { TemplateData } from "./types";
import { Liquid } from "liquidjs";

export default class Templates extends KeyDataSource<TemplateData> {
  static collectionName = "templates";
  static typeSet = new Set(["source", "compiled"]);

  engine = new Liquid({
    outputDelimiterLeft: "<%",
    outputDelimiterRight: "%>",
    fs: {
      readFileSync(file) {
        return this.get(file);
      },
      async readFile(file) {
        return this.get(file);
      },
      existsSync(file) {
        return this.exists(file);
      },
      async exists(file) {
        return this.exists(file);
      },
      resolve(root, file, ext) {
        return file;
      },
    },
  });

  decode = (values) => {
    return values;
  };

  encode = (values) => {
    return values;
  };

  render(name, params) {
    return this.engine.renderFile(name, params);
  }
}
