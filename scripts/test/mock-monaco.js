const path = require("path");
const Module = require("module");
const resolveFilename = Module._resolveFilename;
Module._resolveFilename = function (fileName, ...args) {
  if (fileName === "monaco-editor") return "monaco-editor.mock";
  return resolveFilename.apply(this, arguments);
};
require("module")._extensions[".mock"] = function (module, file) {
  const noop = () => {};
  module.exports = {
    editor: {
      defineTheme: noop,
      setModelLanguage: noop,
    },
    languages: {
      register: noop,
      setLanguageConfiguration: noop,
      setMonarchTokensProvider: noop,
    },

    create: () => ({
      layout: noop,
      setValue: noop,
      getValue: noop,
    }),
  };
};
