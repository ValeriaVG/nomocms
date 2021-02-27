import { test } from "mocha";
import { expect } from "chai";
import { makeExecutableSchema } from "@graphql-tools/schema";
import GraphQL from "./graphql";

const gql = String.raw;

test("GraphQL", async () => {
  const schema = makeExecutableSchema({
    typeDefs: gql`
      type Query {
        hello: String
      }
    `,
    resolvers: {
      Query: {
        hello: () => "world",
      },
    },
  });
  const response = await GraphQL(schema)({} as any, {
    query: gql`
      {
        hello
      }
    `,
  });
  expect(response).to.deep.equal({
    data: {
      hello: "world",
    },
  });
});
