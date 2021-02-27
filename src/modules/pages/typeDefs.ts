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
  }
  # Publicly available page
  type RenderedPage {
    id: ID!
    path: String!
    html: String!
    title: String
    description: String
  }
  type PagesList {
    items: [Page]!
    total: Int!
    nextOffset: Int
  }
  type Query {
    page(id: ID!): Page
    pages(parent: ID, limit: Int, offset: Int): PagesList
    preview(template: ID!, content: String!): RenderedPage
  }
  type Mutation {
    createPage(input: PageInput): Page
    updatePage(id: ID!, input: PageInput): Page
    deletePage(id: ID!): Boolean
  }
`;
