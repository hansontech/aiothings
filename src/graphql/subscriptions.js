// this is an auto generated file. This will be overwritten
import gql from "graphql-tag";

export const SubscribeToEventComments = gql`
  subscription SubscribeToEventComments($eventId: String!) {
    subscribeToEventComments(eventId: $eventId) {
      eventId
      commentId
      content
      createdAt
    }
  }
`;
