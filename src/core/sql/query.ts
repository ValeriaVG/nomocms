import { SimpleType } from "core/types";
import { sql } from "./sql";

type QueryAndValues = [query: string, values: any[]];

export const selectFrom = (
  table: string,
  options: {
    where?: Query | Query[];
    limit?: number;
    offset?: number;
    orderBy?: Record<string, "ASC" | "DESC">;
    columns?: string | string[];
  } = {}
): QueryAndValues => {
  const columns =
    typeof options.columns === "string"
      ? options.columns
      : (options.columns || ["*"]).join(",");
  let query = sql`SELECT ${columns} FROM ${table}`;
  const values = [];
  if (options.where) {
    const [q, v] = where(options.where);
    query += ` WHERE ${q}`;
    values.push(...v);
  }
  if (options.orderBy) {
    query += " ORDER BY ";
    query += Object.entries(options.orderBy)
      .map(([col, dir]) => `${col} ${dir}`)
      .join(",");
  }
  if (options.limit) {
    const n = values.push(options.limit);
    query += ` LIMIT $${n}`;
  }
  if (options.offset) {
    const n = values.push(options.offset);
    query += ` OFFSET $${n}`;
  }
  return [query, values];
};

export const insertInto = (
  table: string,
  data: Record<string, SimpleType>,
  options: {
    returning?: string | string[];
  } = {}
): QueryAndValues => {
  const columns = Object.keys(data);
  let query = sql`INSERT INTO ${table} (${columns.join(
    ","
  )}) VALUES (${columns.map((_, i) => `$${i + 1}`).join(",")})`;
  if (options.returning) {
    query += ` RETURNING ${
      typeof options.returning === "string"
        ? options.returning
        : options.returning.join(",")
    }`;
  }
  return [query, Object.values(data)];
};

export const deleteFrom = (
  table: string,
  options: { where?: Query | Query[] } = {}
): QueryAndValues => {
  let query = sql`DELETE FROM ${table}`;
  const values = [];

  if (options.where) {
    const [q, v] = where(options.where);
    query += ` WHERE ${q}`;
    values.push(...v);
  }

  return [query, values];
};

export const update = (
  table: string,
  options: {
    set: Record<string, SimpleType>;
    where?: Query | Query[];
    returning?: string | string[];
  }
): QueryAndValues => {
  const values = [...Object.values(options.set)];
  const columns = Object.keys(options.set);
  let query = sql`UPDATE ${table} SET ${columns
    .map((column, i) => `${column}=$${i + 1}`)
    .join(",")}`;

  if (options.where) {
    const [q, v] = where(options.where, values.length);
    query += ` WHERE ${q}`;
    values.push(...v);
  }

  if (options.returning) {
    query += ` RETURNING ${
      typeof options.returning === "string"
        ? options.returning
        : options.returning.join(",")
    }`;
  }
  return [query, values];
};

const operators = [
  "=",
  ">",
  "<",
  ">=",
  "<=",
  "like",
  "in",
  "between",
  "is",
] as const;
type QueryOperator = typeof operators[number];
type Query = Record<
  string,
  | SimpleType
  | Partial<Record<QueryOperator, SimpleType>>
  | { in: SimpleType[] }
  | { between: [SimpleType, SimpleType] }
  | { is: "NULL" | "NOT NULL" }
>;

export const where = (
  query: Query | Query[],
  lastIndex: number = 0
): QueryAndValues => {
  if (Array.isArray(query)) {
    return query.reduce(
      (a, c, idx) => {
        if (idx > 0) a[0] += " OR ";
        const [q, v] = where(c, a[1].length);
        a[0] += q;
        a[1].push(...v);
        return a;
      },
      ["", []]
    );
  }
  return Object.entries(query).reduce(
    (a, [key, value], idx) => {
      if (idx > 0) a[0] += " AND ";
      const n = a[1].length + lastIndex + 1;
      if (typeof value !== "object") {
        a[1].push(value);
        a[0] += `${key} = $${n}`;
        return a;
      }
      if (Object.keys(value).length === 1) {
        const operator = Object.keys(value)[0];
        const operand = value[operator];

        if (operator === "in") {
          if (typeof operand === "string") {
            a[0] += `${key} IN (${operand})`;
            return a;
          }

          const arr = operand as SimpleType[];
          a[0] += `${key} IN (${arr.map((_, i) => `$${n + i}`).join(",")})`;
          a[1].push(...arr);
          return a;
        }

        if (operator === "between") {
          a[1].push(operand[0]);
          const from = n;
          a[1].push(operand[1]);
          const to = n + 1;
          a[0] += `${key} BETWEEN $${from} AND $${to}`;
          return a;
        }
        if (operator === "is") {
          a[0] += `${key} IS ${operand}`;
          return a;
        }
        a[1].push(operand);

        a[0] += `${key} ${operator.toUpperCase()} $${n}`;

        return a;
      }
      return a;
    },
    ["", []]
  );
};
