const sass = require("sass");
require("module")._extensions[".scss"] = function (module, file) {
  const { css } = sass.renderSync({ file });
  const names = css.toString().match(/^\.([a-z0-9-]+)/gim);
  module.exports = names.reduce((a, c) => {
    const name = c.slice(1);
    a[name] = name;
    return a;
  }, {});
};
