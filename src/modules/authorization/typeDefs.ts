import gql from "utils/gql";

export default gql`
  enum Permissions {
    all
    delete
    update
    create
    list
    read
    view
  }

  directive @requiresUser on FIELD_DEFINITION

  directive @requiresPermission(
    min: Permissions!
    scope: String
  ) on FIELD_DEFINITION

  type User {
    id: ID!
    email: String!
    name: String
    permissions: Permissions
  }
  type UserLoginResult {
    user: User
    canAccessDashboard: Boolean!
    token: String
  }
  type Mutation {
    login(email: String!, password: String!): UserLoginResult
    logout: Boolean @requiresUser
  }
  type Query {
    access: UserLoginResult @requiresUser
    user(id: ID!): User @requiresPermission(scope: "users", min: read)
  }
`;
