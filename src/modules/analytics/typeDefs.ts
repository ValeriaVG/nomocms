import gql from "utils/gql";

export default gql`
  type PageViews {
    date: Date!
    count: Int!
  }
  type Query {
    pageviews(from: Date, to: Date): [PageViews]
      @requiresPermission(scope: "analytics", min: view)
  }
  type Mutation {
    ping(event: String!, path: String!): String
  }
`;
