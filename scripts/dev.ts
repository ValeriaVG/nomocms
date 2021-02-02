import webpack from "webpack";
import config from "./webpack.config";
import WebpackDevServer from "webpack-dev-server";

const webpackConfig = config("development") as any;

const compiler = webpack(webpackConfig);

const devServerOptions = {
  open: true,
};
const server = new WebpackDevServer(compiler, devServerOptions);

server.listen(9000, "127.0.0.1", () => {
  console.log("Starting server on http://localhost:9000");
});
