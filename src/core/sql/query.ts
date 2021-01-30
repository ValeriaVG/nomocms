import { SimpleType } from "core/types";
import { join } from "ramda";
import { sql } from "./sql";

type QueryAndValues = [query: string, values: any[]];
type WhereQuery = Query | Query[] | string;

export const selectFrom = (
  table: string,
  options: {
    where?: WhereQuery;
    limit?: number;
    offset?: number;
    orderBy?: Record<string, "ASC" | "DESC">;
    columns?: string | string[];
    join?: {
      table: string;
      on: WhereQuery;
      type?: "INNER" | "LEFT" | "RIGHT" | "FULL" | "CROSS";
    };
  } = {}
): QueryAndValues => {
  const columns =
    typeof options.columns === "string"
      ? options.columns
      : (options.columns || ["*"]).join(",");
  let query = sql`SELECT ${columns} FROM ${table}`;
  const values = [];

  if (options.join) {
    const [q, v] = where(options.join.on);
    query += sql` ${options.join.type && options.join.type + " "}JOIN ${
      options.join.table
    } ON ${q}`;
    values.push(...v);
  }

  if (options.where) {
    const [q, v] = where(options.where, values.length);
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
    onConflict?: { constraint?: string } & (
      | {
          update: { set: Record<string, SimpleType> };
        }
      | { do: "NOTHING" | string }
    );
  } = {}
): QueryAndValues => {
  const columns = Object.keys(data);
  let query = sql`INSERT INTO ${table} (${columns.join(
    ","
  )}) VALUES (${columns.map((_, i) => `$${i + 1}`).join(",")})`;
  if (options.onConflict) {
    query += ` ON CONFLICT(${options.onConflict.constraint ?? "id"})`;
    if ("do" in options.onConflict) {
      query += `DO ${options.onConflict.do}`;
    } else {
      const columns = Object.keys(options.onConflict.update.set);
      query += sql` DO UPDATE SET ${columns
        .map((column, i) => `${column}=$${i + 1}`)
        .join(",")}`;
    }
  }
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
  options: { where?: WhereQuery } = {}
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
    where?: WhereQuery;
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
  "$", // column
] as const;
type QueryOperator = typeof operators[number];
export type Query = Record<
  string,
  | SimpleType
  | Partial<Record<QueryOperator, SimpleType>>
  | { in: SimpleType[] }
  | { between: [SimpleType, SimpleType] }
  | { is: "NULL" | "NOT NULL" }
>;

export const where = (
  query: WhereQuery,
  lastIndex: number = 0
): QueryAndValues => {
  if (typeof query === "string") return [query, []];
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
        if (operator === "$") {
          a[0] += `${key} = ${operand}`;
          return a;
        }

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
