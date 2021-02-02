import webpack from "webpack";
import config from "../webpack.config";

const webpackConfig = config("production") as any;

const compiler = webpack(webpackConfig);

compiler.run((err, stats) => {
  if (err) return console.error(err);
  console.log(
    stats.toString({
      colors: true,
      chunks: false,
    })
  );
});
