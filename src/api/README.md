# API Resolvers

Internally, API resolvers are similar to GraphQL resolvers,
i.e. are async functions, accepting request parameters and request context:

```ts
{
  item: {
    GET: ({ id }, { items }) => {
      return { item: items.get(id) };
    },
    POST: ({ input }, { items }: typeof ctx) => {
      const id = "itm_" + items.size;
      const item = { id, ...input };
      return { item, code: 201 };
    },
    DELETE: () => ({
      success: true,
    }),
  },
  items: { GET: () => ({ items: [...items.entries()] }) }
}
```

Resolvers should always return an object. Responses can have an explicit status code, otherwise, the server will respond with code 200.
