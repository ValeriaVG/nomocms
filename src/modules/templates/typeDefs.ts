import gql from "utils/gql";

export default gql`
  type Template {
    id: ID!
    source: String!
  }
  type TemplateList {
    items: [Template]
    total: Int
    nextOffset: Int
  }
  input TemplateInput {
    id: ID!
    source: String!
  }
  type Query {
    template(id: ID!): Template
      @requiresPermission(scope: "templates", min: read)
    templates(limit: Int, offset: Int): TemplateList
      @requiresPermission(scope: "templates", min: list)
  }
  type Mutation {
    createTemplate(input: TemplateInput!): Template
      @requiresPermission(scope: "templates", min: create)
    updateTemplate(id: ID!, input: TemplateInput!): Template
      @requiresPermission(scope: "templates", min: update)
    deleteTemplate(id: ID!): Boolean
      @requiresPermission(scope: "templates", min: delete)
  }
`;
