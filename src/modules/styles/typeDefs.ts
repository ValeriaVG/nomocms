import gql from "utils/gql";

export default gql`
  type Style {
    id: ID!
    source: String!
  }
  type StyleList {
    items: [Style]
    total: Int
    nextOffset: Int
  }
  input StyleInput {
    id: ID!
    source: String!
  }
  type Query {
    style(id: ID!): Style @requiresPermission(scope: "styles", min: read)
    styles(limit: Int, offset: Int): StyleList
      @requiresPermission(scope: "styles", min: list)
  }
  type Mutation {
    createStyle(input: StyleInput!): Style
      @requiresPermission(scope: "styles", min: create)
    updateStyle(id: ID!, input: StyleInput!): Style
      @requiresPermission(scope: "styles", min: update)
    deleteStyle(id: ID!): Boolean
      @requiresPermission(scope: "styles", min: delete)
  }
`;
