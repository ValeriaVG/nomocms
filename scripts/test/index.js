require("ts-node").register({
  require: ["tsconfig-paths/register"],
});
require("./sass-modules");
require("./jsdom");
require("./index.ts");
