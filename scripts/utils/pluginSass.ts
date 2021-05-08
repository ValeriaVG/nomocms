import { createStylesheetProps } from "fuse-box/config/createStylesheetProps";
import { Context } from "fuse-box/core/context";
import { sassHandler } from "./sassHandler";
import { IPluginCommon } from "fuse-box/plugins/interfaces";
import { parsePluginOptions } from "fuse-box/plugins/pluginUtils";
import { cssContextHandler } from "fuse-box/plugins/core/shared";

export function pluginSass(
  a?: IPluginCommon | RegExp | string,
  b?: IPluginCommon
) {
  let [opts, matcher] = parsePluginOptions<IPluginCommon>(a, b, {});
  return (ctx: Context) => {
    opts.stylesheet = createStylesheetProps({
      ctx,
      stylesheet: opts.stylesheet || {},
    });
    if (!matcher) matcher = /\.(scss|sass)$/;
    ctx.ict.on("bundle_resolve_module", (props) => {
      const { module } = props;

      if (props.module.captured || !matcher.test(module.absPath)) {
        return;
      }

      ctx.log.info("sass", module.absPath);

      props.module.read();
      props.module.captured = true;

      const sass = sassHandler({ ctx: ctx, module, options: opts.stylesheet });

      if (!sass) return;

      // A shared handler that takes care of development/production render
      // as well as setting according flags
      // It also accepts extra properties (like asText) to handle text rendering
      // Accepts postCSS Processor as well
      cssContextHandler({
        ctx,
        fuseCSSModule: ctx.meta["fuseCSSModule"],
        module: module,
        options: opts.stylesheet,
        processor: sass,
        shared: opts,
      });

      return props;
    });
  };
}
