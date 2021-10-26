import { Liquid } from "liquidjs";
import { LiquidOptions } from "liquidjs/dist/liquid-options";
export default function createEngine(options: LiquidOptions = {}) {
  return new Liquid(
    Object.assign(
      {
        outputDelimiterLeft: "<%",
        outputDelimiterRight: "%>",
        tagDelimiterLeft: "{%",
        tagDelimiterRight: "%}",
      },
      options
    )
  );
}
