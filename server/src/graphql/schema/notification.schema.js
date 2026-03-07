export const notificationSchema = `#graphql

input EntityInput {
  type: String!
  id: ID!
}

type EntityOutput {
  type: String!
  id: ID!
}

type Notification {
  id: ID!
  recipients: [ID!]!
  sender: ID
  type: String
  title: String
  message: String
  entity: EntityOutput
  isRead: Boolean
  createdAt: String
}

input AddNotifInput {
  recipients: [ID!]!
  sender: ID
  type: String
  title: String
  message: String
  entity: EntityInput
  isRead: Boolean
}

type Query {
  notifications: [Notification!]!
  notification(id: ID!): Notification
}

type Mutation {
  createNotif(input: AddNotifInput!): Notification!
  markNotificationRead(id: ID!): Notification!
}

type Subscription {
  notificationAdded(userId: ID!): Notification!
}
`;
