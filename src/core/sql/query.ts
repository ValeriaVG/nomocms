import { SimpleType } from "core/types";
import { sql } from "./sql";

type QueryAndValues = [query: string, values: any[]];

export const select = (
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
    query += " LIMIT ?";
    values.push(options.limit);
  }
  if (options.offset) {
    query += " OFFSET ?";
    values.push(options.offset);
  }
  return [query, values];
};

export const insert = (
  table: string,
  data: Record<string, any>
): QueryAndValues => [sql`INSERT INTO ${table} () VALUES`, []];

export const del = (table: string, options: {}): QueryAndValues => [
  sql`DELETE FROM ${table} WHERE`,
  [],
];
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

export const where = (query: Query | Query[]): QueryAndValues => {
  if (Array.isArray(query)) {
    return query.reduce(
      (a, c, idx) => {
        if (idx > 0) a[0] += " OR ";
        const [q, v] = where(c);
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
      if (typeof value !== "object") {
        a[0] += `${key} = ?`;
        a[1].push(value);
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
          a[0] += `${key} IN (${arr.map((_) => "?").join(",")})`;
          a[1].push(...arr);
          return a;
        }

        if (operator === "between") {
          a[0] += `${key} BETWEEN ? AND ?`;
          a[1].push(operand[0], operand[1]);
          return a;
        }
        if (operator === "is") {
          a[0] += `${key} IS ${operand}`;
          return a;
        }

        a[0] += `${key} ${operator.toUpperCase()} ?`;
        a[1].push(operand);

        return a;
      }
      return a;
    },
    ["", []]
  );
};
