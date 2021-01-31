const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const path = require("path");

module.exports = {
  entry: path.resolve(__dirname, "../src/dashboard/index.ts"),
  output: {
    path: path.resolve(__dirname, "../.dashboard"),
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.ttf$/,
        use: ["file-loader"],
      },
    ],
  },
  plugins: [new MonacoWebpackPlugin()],
};
