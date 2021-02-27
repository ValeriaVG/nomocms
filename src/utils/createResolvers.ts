import { SQLDataSource } from "../core/sql";
import { ListParams } from "../core/types";

export function createResolvers<
  T extends { id: number | string },
  I = Omit<T, "id">,
  P = I
>(
  scope: string,
  overrides: Partial<Record<"singular" | "plural", string>> = {}
) {
  type D = SQLDataSource<T, I, P>;

  const singular = overrides.singular || scope.slice(0, -1);
  const plural = overrides.plural || scope;
  const Singular = singular.charAt(0).toUpperCase() + singular.slice(1);

  return {
    Query: {
      [plural]: (_, params: ListParams, ctx) => (ctx[scope] as D).list(params),
      [singular]: (_, { id }: { id: T["id"] }, ctx) =>
        (ctx[scope] as D).get(id),
    },
    Mutation: {
      [`create${Singular}`]: (_, { input }: { input: I }, ctx) =>
        (ctx[scope] as D).create(input),
      [`update${Singular}`]: (
        _,
        { id, input }: { id: number; input: P },
        ctx
      ) => (ctx[scope] as D).update(id, input),
      [`delete${Singular}`]: (_, { id }: { id: T["id"] }, ctx) =>
        (ctx[scope] as D).delete(id),
    },
  };
}
