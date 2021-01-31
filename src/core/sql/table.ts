import { sql } from "./sql";

export type ColumnDefinition = {
  type: ColumnType;
  length?: number;
  unique?: boolean;
  default?: string;
  nullable?: boolean;
  primaryKey?: boolean;
};

export const makeColumn = (key: string, definition: ColumnDefinition) => {
  const properties = [];
  if ("length" in definition) properties.push(`(${definition.length})`);
  if (definition.primaryKey) properties.push("PRIMARY KEY");
  if (definition.unique) properties.push("UNIQUE");
  if (!definition.nullable) properties.push("NOT NULL");
  if ("default" in definition) properties.push(`DEFAULT ${definition.default}`);
  return `${key} ${definition.type} ${properties.join(" ")}`;
};

export const createTable = <C extends Record<string, ColumnDefinition>>(
  name: string,
  columns: C,
  options: { ifNotExists?: boolean; primaryKey?: Array<keyof C> } = {}
): string => {
  return sql`CREATE TABLE${options.ifNotExists && " IF NOT EXISTS"} ${name} (${[
    ...Object.entries(columns).map((args) => makeColumn(...args)),
    options.primaryKey && ` PRIMARY KEY (${options.primaryKey.join(",")})`,
  ]
    .filter(Boolean)
    .join(",")})`;
};

export const dropTable = (name: string, options: { ifExists?: boolean } = {}) =>
  sql`DROP TABLE${options.ifExists && " IF EXISTS"} ${name}`;

export enum AlterMode {
  add = "ADD",
  drop = "DROP COLUMN",
  alter = "ALTER COLUMN",
  modify = "MODIFY",
  add_const = "ADD CONSTRAINT",
  drop_const = "DROP CONSTRAINT",
}

export type AlterTableOptions =
  | {
      mode: AlterMode.add | AlterMode.modify;
      name: string;
      definition: ColumnDefinition;
    }
  | { mode: AlterMode.drop; name: string }
  | { mode: AlterMode.alter; name: string; type: ColumnType }
  | { mode: AlterMode.drop_const; constant: string }
  | { mode: AlterMode.add_const; constant: string };

export const alterTable = (name: string, options: AlterTableOptions) => {
  const alter_table = sql`ALTER TABLE ${name} ${options.mode} `;
  switch (options.mode) {
    case AlterMode.add:
    case AlterMode.modify:
      return alter_table + makeColumn(options.name, options.definition);
    case AlterMode.drop:
      return alter_table + options.name;
    case AlterMode.alter:
      return alter_table + sql`${options.name} TYPE ${options.type}`;
    case AlterMode.add_const:
      return alter_table + options.constant;
    case AlterMode.drop_const:
      return alter_table + options.constant;
    default:
      throw new Error("Unknown mode:" + (options as any).mode);
  }
};

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
  | "xml";
