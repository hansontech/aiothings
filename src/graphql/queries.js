// this is an auto generated file. This will be overwritten
import gql from "graphql-tag";

export const GetEvent = gql`
  query GetEvent($id: ID!) {
    getEvent(id: $id) {
      id
      name
      where
      when
      description
      comments {
        nextToken
      }
    }
  }
`;
export const ListEvents = gql`
  query ListEvents(
    $filter: TableEventFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listEvents(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        where
        when
        description
      }
      nextToken
    }
  }
`;
