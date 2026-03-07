import Notification from "../../model/Notification.js";
import { PubSub } from "graphql-subscriptions";

const pubsub = new PubSub();

export const notificationResolvers = {
  Query: {
    notifications: async (_, __, context) => {
      if (!context?.user) throw new Error("Unauthorized");

      const notifications = await Notification.find({
        recipients: context.user.id,
      })
        .sort({ createdAt: -1 })
        .populate("sender")
        .populate("recipients");

      return notifications.map(formatNotification);
    },

    notification: async (_, { id }, { user }) => {
      if (!user) throw new Error("Unauthorized");

      const notif = await Notification.findById(id)
        .populate("recipients")
        .populate("sender");
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

      // Populate sender and recipients before formatting
      await notification.populate("sender");
      await notification.populate("recipients");

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
      )
        .populate("sender")
        .populate("recipients");

        if (!notif) throw new Error("Notification not found");

      const formatted = formatNotification(notif);

      notif.recipients.forEach((recipient) => {
        pubsub.publish(`NOTIFICATION_${recipient._id}`, {
          notificationMarkAsRead: formatted,
        });
      });

      return formatted;
    },
  },

  Subscription: {
    notificationAdded: {
      subscribe: (_, { userId }) =>
        pubsub.asyncIterator(`NOTIFICATION_${userId}`),
    },
    notificationMarkAsRead: {
      subscribe: (_, { userId }) =>
        pubsub.asyncIterator(`NOTIFICATION_${userId}`),
    },
  },
};

// helper formatter
function formatNotification(notif) {
  // Helper to format a user object
  const formatUser = (user) => {
    if (!user) return null;
    return {
      id: user._id?.toString() || user.id?.toString(),
      fullname: user.fullname,
      department: user.department,
      role: user.role,
      position: user.position,
      email: user.email,
      username: user.username,
      status: user.status,
      createdAt: user.createdAt?.toISOString(),
      updatedAt: user.updatedAt?.toISOString(),
    };
  };

  return {
    id: notif._id.toString(),
    recipients: notif.recipients.map((r) => formatUser(r)),
    sender: formatUser(notif.sender),
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
