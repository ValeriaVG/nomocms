export type ColumnDefinition = {
  type: ColumnType;
  length?: number;
  unique?: boolean;
  default?: string;
  nullable?: boolean;
  primaryKey?: boolean;
};

export default abstract class SQLTable {
  static columns: Record<string, ColumnDefinition> = {};
  static get tableName() {
    return this.prototype.constructor.name.toLowerCase();
  }

  static createTableQuery() {
    return [
      `CREATE TABLE ${this.tableName} (`,
      Object.entries(this.columns)
        .map((args) => makeColumnQuery(...args))
        .join(","),
      ");",
    ].join("");
  }

  static syncTableQueries(previous: Record<string, ColumnDefinition>) {
    const queries = [];
    const previousNames = Object.keys(previous);
    const currentNames = Object.keys(this.columns);
    for (
      let i = 0;
      i < Math.max(previousNames.length, currentNames.length);
      i++
    ) {
      const from = previousNames[i];
      const to = currentNames[i];
      if (!from) {
        queries.push(`ADD COLUMN ${makeColumnQuery(to, this.columns[to])}`);
        continue;
      }
      if (!to) {
        queries.push(`DROP COLUMN ${from}`);
        continue;
      }
      if (to !== from) {
        queries.push(`RENAME COLUMN ${from} ${to}`);
      }
      const settingsFrom = previous[from];
      const settingsTo = this.columns[to];
      if (settingsFrom.type !== settingsTo.type) {
        queries.push(
          `ALTER COLUMN ${to} ${settingsTo.type}${
            "length" in settingsTo && ` (${settingsTo.length})`
          }`
        );
      }
      // TODO: Constraints
    }
    return queries.map((query) => `ALTER TABLE ${this.tableName} ${query};`);
  }

  static selectQuery(filter: SQLQuery, params: SQLParams = {}) {
    const [filtesQuery, vars] = makeFiltersQuery(filter);
    const [paramsQuery, paramsVars] = makeParamsQuery(params);

    const query = `SELECT * FROM ${this.tableName} WHERE ${filtesQuery} ${paramsQuery}`;

    return [query, [...vars, ...paramsVars]];
  }

  static insertQuery(object: Record<string, any>) {
    const [fields, params] = Object.entries(object).reduce(
      ([fields, params], [key, value]) => {
        fields.push(key);
        params.push(value);
        return [fields, params];
      },
      [[], []]
    );
    return [
      `INSERT INTO ${this.tableName} (` +
        fields.join(", ") +
        `) VALUES(${params.map((_) => "?").join(",")})`,
      params,
    ];
  }
}

export type SQLQuery<K extends string = string> =
  | Record<K, any>
  | { or: SQLQuery[] }
  | { and: SQLQuery };

export type SQLParams<K extends string = string> = {
  limit?: number;
  offset?: number;
  orderBy?: K | [K, "asc" | "desc" | "ASC" | "DESC"];
};

export function Column(definition: ColumnDefinition) {
  return (target: SQLTable, propertyKey: string) => {
    (target.constructor as typeof SQLTable).columns[propertyKey] = definition;
  };
}

export function makeColumnQuery(key: string, definition: ColumnDefinition) {
  const properties = [];
  if ("length" in definition) properties.push(`(${definition.length})`);
  if (definition.primaryKey) properties.push("PRIMARY KEY");
  if (definition.unique) properties.push("UNIQUE");
  if (!definition.nullable) properties.push("NOT NULL");
  if ("default" in definition) properties.push(`DEFAULT ${definition.default}`);
  return `${key} ${definition.type} ${properties.join(" ")}`;
}

export function makeFiltersQuery(filter: SQLQuery) {
  if (!filter) return ["", []];
  return Object.entries(filter).reduce(
    ([query, params], [key, value]) => {
      // OR Case
      if (Array.isArray(value)) {
        const [q, p] = value.reduce(
          (a, c) => {
            const [q, p] = makeFiltersQuery(c);
            return [
              [...a[0], q],
              [...a[1], ...p],
            ];
          },
          [[], []]
        );
        return [query + q.join(" OR "), [...params, ...p]];
      }
      // AND case
      if (typeof value === "object") {
        const conditions = Object.entries(value).map(([k, v]) => {
          params.push(v);
          return `${key}${k}?`;
        });
        query = conditions.join(" AND ");
        return [query, params];
      }
      // Assert case
      query += `${key}=?`;
      params.push(value);
      return [query, params];
    },
    ["", []]
  );
}

export function makeParamsQuery(params: SQLParams) {
  const query = [];
  const vars = [];
  if ("limit" in params) {
    query.push("LIMIT ?");
    vars.push(params.limit);
  }
  if ("offset" in params) {
    query.push("OFFSET ?");
    vars.push(params.offset);
  }
  if (typeof params.orderBy === "string") {
    query.push(`ORDER BY ?`);
    vars.push(params.orderBy);
  } else if (params.orderBy) {
    const [field, dir] = params.orderBy;
    query.push(`ORDER BY ? ${dir.toUpperCase() === "DESC" ? "DESC" : "ASC"}`);
    vars.push(field);
  }
  return [query.join(" "), vars];
}

export type ColumnType =
  | "bigint"
  | "int8"
  | "bigserial"
  | "bit"
  | "bit varying"
  | "varbit"
  | "boolean"
  | "bool"
  | "box"
  | "bytea"
  | "character"
  | "char"
  | "character varying"
  | "varchar"
  | "cidr"
  | "circle"
  | "date"
  | "double precision"
  | "float 8"
  | "inet"
  | "integer"
  | "int"
  | "int4"
  | "interval"
  | "json"
  | "jsonb"
  | "line"
  | "lsec"
  | "macaddr"
  | "money"
  | "numeric"
  | "decimal"
  | "path"
  | "pg_lsn"
  | "point"
  | "polygon"
  | "real"
  | "float4"
  | "smallint"
  | "int2"
  | "smallserial"
  | "serial"
  | "text"
  | "time"
  | "timetz"
  | "timestamp"
  | "timestamptz"
  | "tsquery"
  | "tsvector"
  | "txid_snapshot"
  | "uuid"
  | "xml"
  | string;
