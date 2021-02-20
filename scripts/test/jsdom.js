const { JSDOM } = require("jsdom");
const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
  url: "http://localhost",
  contentType: "text/html",
  pretendToBeVisual: true,
});
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.HTMLElement = window.HTMLElement;
globalThis.window.fetch = require("node-fetch");
globalThis.Event = dom.window.Event;
globalThis.CustomEvent = dom.window.CustomEvent;
