// this is an auto generated file. This will be overwritten
import gql from "graphql-tag";

export const CreateEvent = gql`
  mutation CreateEvent(
    $name: String!
    $when: String!
    $where: String!
    $description: String!
  ) {
    createEvent(
      name: $name
      when: $when
      where: $where
      description: $description
    ) {
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
export const DeleteEvent = gql`
  mutation DeleteEvent($id: ID!) {
    deleteEvent(id: $id) {
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
export const CommentOnEvent = gql`
  mutation CommentOnEvent(
    $eventId: ID!
    $content: String!
    $createdAt: String!
  ) {
    commentOnEvent(
      eventId: $eventId
      content: $content
      createdAt: $createdAt
    ) {
      eventId
      commentId
      content
      createdAt
    }
  }
`;
