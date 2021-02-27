# Modules

Modular system in NoMoCMS allows easily define scoped GraphQL schemes, test it in isolation and merge required modules in one executable scheme.

Every module is an object with following optional properties

- `dataSources` - objects to be initialized and joined context, providing database, third party services mappings and other data sources.
- `resolvers` - GraphQL field resolvers
- `typeDefs` - GraphQL type definitions
- `directiveResolvers` - GraphQL directive resolvers

Module `resolvers`, `typeDefs` and `directiveResolvers` are the same as `createExecutableSchema` from `@graphql-tools/schema` accepts.

AppModule definition:

```ts
export type AppModule = {
  dataSources?: Record<string, typeof DataSource>;
  typeDefs?: ITypeDefinitions;
  resolvers?: IResolvers<any, APIContext>;
  directiveResolvers?: IDirectiveResolvers<any, any>;
};
```

Module example:

```ts
import Analytics from "./Analytics";
import resolvers from "./resolvers";
import typeDefs from "./typeDefs";

export default {
  resolvers,
  typeDefs,
  dataSources: {
    analytics: Analytics,
  },
};
```
