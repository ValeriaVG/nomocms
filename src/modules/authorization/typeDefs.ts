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

  input UserInput {
    email: String!
    permissions: Permissions
    password: String
    name: String
  }

  type UserList {
    items: [User]
    total: Int
    nextOffset: Int
  }

  type Mutation {
    login(email: String!, password: String!): UserLoginResult
    logout: Boolean @requiresUser

    createUser(input: UserInput): User
      @requiresPermission(scope: "users", min: create)
    updateUser(id: ID!, input: UserInput): User
      @requiresPermission(scope: "users", min: update)
    deleteUser(id: ID!): Boolean
      @requiresPermission(scope: "users", min: delete)
  }
  type Query {
    access: UserLoginResult @requiresUser
    user(id: ID!): User @requiresPermission(scope: "users", min: read)
    users(limit: Int, offset: Int): UserList
      @requiresPermission(scope: "users", min: list)
  }
`;
