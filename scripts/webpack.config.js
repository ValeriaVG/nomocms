const webpack = require("webpack");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const path = require("path");

const configFile = path.join(__dirname, "../tsconfig.json");
module.exports = (mode) => {
  console.log(`Running in ${mode} mode`);
  const isDevelopment = mode === "development";
  const isProduction = mode === "production";
  process.env.NODE_ENV = mode;
  return {
    entry: path.resolve(__dirname, "../src/dashboard/index.ts"),
    output: {
      path: path.resolve(__dirname, "../.dashboard"),
    },
    mode,
    bail: isProduction,
    devtool: isDevelopment ? "cheap-module-source-map" : false,
    resolve: {
      extensions: [".wasm", ".mjs", ".js", ".json", ".ts", ".tsx"],
      plugins: [
        new TsconfigPathsPlugin({
          configFile,
        }),
      ],
      fallback: { path: false, fs: false },
    },
    module: {
      rules: [
        {
          oneOf: [
            {
              test: /\.(j|t)sx?$/,
              include: path.resolve(__dirname, "../src"),
              use: {
                loader: "babel-loader",
                options: {
                  presets: [
                    [
                      "babel-preset-react-app",
                      {
                        runtime: "automatic",
                      },
                    ],
                  ],
                  plugins: [
                    [
                      "babel-plugin-named-asset-import",
                      {
                        loaderMap: {
                          svg: {
                            ReactComponent:
                              "@svgr/webpack?-svgo,+titleProp,+ref![path]",
                          },
                        },
                      },
                    ],
                    isDevelopment && "react-refresh/babel",
                  ].filter(Boolean),
                  cacheDirectory: true,
                  cacheCompression: false,
                  compact: isProduction,
                },
              },
            },
            {
              test: /\.(js|mjs)$/,
              exclude: /@babel(?:\/|\\{1,2})runtime/,
              loader: require.resolve("babel-loader"),
              options: {
                babelrc: false,
                configFile: false,
                compact: false,
                presets: [
                  [
                    require.resolve("babel-preset-react-app/dependencies"),
                    { helpers: true },
                  ],
                ],
                cacheDirectory: true,
                cacheCompression: false,
                sourceMaps: false,
                inputSourceMap: false,
              },
            },
            {
              test: /\.(s[ac]|c)ss$/i,
              use: ["style-loader", "css-loader", "sass-loader"],
            },
            {
              test: /\.ttf$/,
              use: ["file-loader"],
            },
          ],
        },
      ],
    },
    plugins: [
      new CleanWebpackPlugin(),
      new ForkTsCheckerWebpackPlugin(),
      new HtmlWebpackPlugin({
        title: "AMP CMS",
        template: path.resolve(__dirname, "../src/dashboard/public/index.html"),
      }),
      new MonacoWebpackPlugin(),
      new webpack.DefinePlugin({
        process: JSON.stringify({ env: {}, platform: "" }),
      }),
      new webpack.EnvironmentPlugin({
        NODE_ENV: mode,
        PUBLIC_URL: "/",
        CMS_API_URL: "http://localhost:8080",
        VERSION: require("../package.json").version,
        TERM: "",
      }),
      isDevelopment && new webpack.HotModuleReplacementPlugin(),
      isDevelopment && new ReactRefreshWebpackPlugin(),
    ].filter(Boolean),
    optimization: {
      splitChunks: {
        chunks: "all",
      },
      runtimeChunk: {
        name: (entrypoint) => `runtime-${entrypoint.name}`,
      },
      minimize: isProduction,
      minimizer: [
        new OptimizeCssAssetsPlugin({
          cssProcessorOptions: {
            map: {
              inline: false,
              annotation: true,
            },
          },
        }),
        new TerserPlugin({ parallel: true }),
      ],
    },
  };
};
