import gql from "utils/gql";

export default gql`
  # Internal page object
  type Page {
    id: ID!
    path: String!
    title: String
    content: String!
  }
  input PageInput {
    content: String!
    template: ID
    parent_id: ID
  }
  type PagesList {
    items: [Page]!
    total: Int
    nextOffset: Int
  }
  type Query {
    page(id: ID!): Page @requiresPermission(scope: "pages", min: read)
    pages(parent: ID, limit: Int, offset: Int): PagesList
      @requiresPermission(scope: "pages", min: list)
  }
  type Mutation {
    createPage(input: PageInput): Page
      @requiresPermission(scope: "pages", min: create)
    updatePage(id: ID!, input: PageInput): Page
      @requiresPermission(scope: "pages", min: update)
    deletePage(id: ID!): Boolean
      @requiresPermission(scope: "pages", min: delete)
  }
`;
