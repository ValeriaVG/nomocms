# Modules

Modular system in NoMoCMS allows us to define custom endpoints for both front- and backend.
Every module is independent of one another and the only requirement for them is to have one or several following properties exported as a module:

- `dataSources` - describing the connection to a database, third party services and etc.
- `routes` - describing routes and related responses.

## Routes

Examples:

```ts
export default {
  "/amp/items/:id": ({ id }) => ({ type: "amp", body: `<h1>${id}</h1>` }), // Renders AMP boilerplate
  "/html/items/:id": ({ id }) => ({
    type: "html",
    data: `<html><head><style>...</style></head><body><div>...</div></body>`,
  }), // Renders  HTML page
  "/json/items/:id": ({ id }) => ({ id }), // Renders JSON
  "/files/:name": ({ name }) => ({
    type: "image/png",
    data: fs.createReadStream(`path/to/files/${name}`),
  }),
  "/json/items/:id": {
    GET: ({ id }) => ({ id }),
    POST: ({ id }) => ({ id }),
  },
};
```
