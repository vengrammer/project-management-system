import Notification from "../../model/Notification.js";
import { PubSub } from "graphql-subscriptions";

const pubsub = new PubSub();

export const notificationResolvers = {
  Query: {
    notifications: async (_, __, context) => {
      if (!context?.user) throw new Error("Unauthorized");

      const notifications = await Notification.find({
        recipients: context.user.id,
      }).sort({ createdAt: -1 });

      return notifications.map(formatNotification);
    },

    notification: async (_, { id }, { user }) => {
      if (!user) throw new Error("Unauthorized");

      const notif = await Notification.findById(id);
      if (!notif) throw new Error("Notification not found");

      return formatNotification(notif);
    },
  },

  Mutation: {
    createNotif: async (_, { input }, { user }) => {
      if (!user) throw new Error("Unauthorized");

      const notification = await Notification.create({
        recipients: input.recipients,
        sender: input.sender || user.id,
        type: input.type,
        title: input.title,
        message: input.message,
        entity: input.entity,
        isRead: input.isRead ?? false,
      });

      const formatted = formatNotification(notification);

      // send notification to each recipient
      input.recipients.forEach((recipientId) => {
        pubsub.publish(`NOTIFICATION_${recipientId}`, {
          notificationAdded: formatted,
        });
      });

      return formatted;
    },

    markNotificationRead: async (_, { id }, { user }) => {
      if (!user) throw new Error("Unauthorized");

      const notif = await Notification.findByIdAndUpdate(
        id,
        { isRead: true },
        { new: true },
      );

      return formatNotification(notif);
    },
  },

  Subscription: {
    notificationAdded: {
      subscribe: (_, { userId }) =>
        pubsub.asyncIterator(`NOTIFICATION_${userId}`),
    },
  },
};

// helper formatter
function formatNotification(notif) {
  return {
    id: notif._id.toString(),
    recipients: notif.recipients.map((r) => r.toString()),
    sender: notif.sender?.toString() || null,
    type: notif.type,
    title: notif.title,
    message: notif.message,
    entity: notif.entity
      ? {
          type: notif.entity.type,
          id: notif.entity.id.toString(),
        }
      : null,
    isRead: notif.isRead,
    createdAt: notif.createdAt.toISOString(),
  };
}
