# DataSource

Initially, AMP CMS used Redis as it's primary database, but because AMP CMS is intended to be used primarily with Digital Ocean APP Platform, the decision was made to change database to PostgreSQL

Primarily, due to the lack of disk data persistence on Digital Ocean managed Redis.
And, additionaly, to simplify setup with "Deploy to Digital Ocean" button

## SQLTable

SQLTable class is inspired by TypeORM and also uses decorators to specify column types.
The main difference is that SQLTable is much lighter and does not depend on global variables, making this class much easier to test.

Example:

```ts
class Users extends SQLTable {
  @Column({ type: "serial", primaryKey: true })
  id: string;
  @Column({ type: "varchar", length: 255, nullable: true })
  name?: string;
  @Column({ type: "text" })
  pwhash: string;
  @Column({ type: "varchar", length: 50, unique: true })
  email: string;
  @Column({ type: "timestamp", default: "NOW()" })
  created_at: number;
}
```

## Using SQLTable

SQLTable extends `CRUDLDataSource` and has CRUDL methods:

```ts
const users = new Users({db}:{db: PostreSQLClient})
const user = await users.create({name:'John Doe'})
await users.update(user.id, {name:'John Doe'})
const allUsers = await users.list()
const aUser = await users.get(user.id)
await users.delete(user.id)
```

Additionally, SQLTable implements the following methods:

```ts
const joe = await users.findOne({ email: "john.doe@email.com" });
const allJohns = await users.find({ name: "John" });
const allUsers = await users.find({ created_at: { ">=": Date.now() } });
const anyDoe = await users.findOne({ name: { like: "% Doe" } });
```

In case a custom query needs to be executed, static `Users.tableName` can be used.

## Creating and syncronizing tables

SQLTable has static methods `createTableQuery` and `syncTableQueries` to generate queries to create and synchronize table columns respectrully.

> WARNING: Table syncronization is experimental and not recommended to be used in production
