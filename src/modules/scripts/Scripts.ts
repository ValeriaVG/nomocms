import { DataSource, InitializedContext } from "core/types";
import Pages from "modules/pages/Pages";

/**
 * Script methods can be specified in a template
 * to perform a backend script before render
 * to populate extra json values
 * @warn Scripts should return JSON
 */
export default class Scripts extends DataSource {
  constructor(protected context: InitializedContext) {
    super(context);
  }

  getChildPages = async ({ id }) => {
    const items = await (this.context.pages as Pages).find({
      where: { parent_id: id, code: "200" },
      limit: 10,
    });
    return { items };
  };
}
