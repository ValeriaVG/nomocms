require("ts-node").register({
  require: ["tsconfig-paths/register"],
});
require("./sass-modules");
require("./jsdom");
require("./mock-monaco.js");
require("./index.ts");
