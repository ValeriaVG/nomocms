# DataSource

API CMS uses Redis as it's primary database.
DataSource class provides common CRUD operations as well as listing and indexing. Every _entity_ is stored as `hash`, with a variety of secondary indexes. Hash parameters, along with everything else in Redis, are stored as strings, therefore in order to reconstruct the original JSON, one must provide information about its types.

Each entity data source should extend DataSource and provide:

- collection name, e.g. `items`
- id prefix, e.g. `itm`
- type information

Type information is stored using the following data type classes, mapped with property name:

- TBoolean
- TInt
- TFloat
- TString
- TJSON

These classes provide an interface for encoding and decoding values to and from strings.
Null values are stored as Unicode NUL `\u0000`

A generic `items` data source would look the following way:

```ts
class Items extends RedisDataSource<{ title: string }> {
  collection = "items";
  prefix = "itm";
  schema = {
    title: TString,
  };
}
```
