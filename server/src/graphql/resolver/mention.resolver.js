import Mention from "../../model/mentions.model.js"
import User from "../../model/user.model.js"
import mongoose from "mongoose";
import { publishNotificationToRecipients } from "./notification.resolver.js";

export const mentionResolver = {
    Mention: {
        sender: async (parent) => {
            const user = await User.findById(parent.sender);
            return user;
        },
        recipients: async (parent) => {
            const users = await User.find({ _id: { $in: parent.recipients } });
            return users;
        },
    },
    Reply: {
        sender: async (parent) => {
            if (!parent?.sender) {
                return null;
            }

            return User.findById(parent.sender);
        },
    },
    Query: {
        mentionsBySender: async (_, { senderId }, context) => {
            const userId = senderId || context?.user?.id;
            if (!userId) {
                throw new Error("User ID is required to fetch mentions");
            }

            return getMentionsWithUsers({ sender: new mongoose.Types.ObjectId(userId) });
        },
        mentionsByRecipient: async (_, { recipientId }, context) => {
            const userId = recipientId || context?.user?.id;
            if (!userId) {
                throw new Error("User ID is required to fetch mentions");
            }

            return getMentionsWithUsers({ recipients: new mongoose.Types.ObjectId(userId) });
        },
        mentionsByDateMention: async (_, { datemention, userId, isSender }, context) => {
            const currentUserId = userId || context?.user?.id;

          

            if (!currentUserId) {
                throw new Error("User ID is required to fetch mentions");
            }

            // Build dynamic match condition
            const { start, end } = getDateRange(datemention);

            let matchCondition = {
                datemention: {
                    $gte: start,
                    $lte: end
                }
            };

            

            if (isSender) {
                matchCondition.sender = new mongoose.Types.ObjectId(currentUserId);
            } else {
                matchCondition.recipients = new mongoose.Types.ObjectId(currentUserId);
            }

            // console.log("matchCondition:", matchCondition);

            return getMentionsWithUsers(matchCondition);
        },
        mention: async (_, { id }) => {
            
            const mention = await Mention.findById(id);
            return mention;
        },
    },
    Mutation: {
        createMention: async (_, { sender, recipients, message, datemention }, context) => {

            const userId = sender || context?.user?.id;
            if (!userId) {
                throw new Error("User ID is required to fetch projects");
            }

            const senderUser = await User.findById(userId);
            const mention = await Mention.create({
                sender: userId,
                recipients: recipients,
                message: message,
                datemention: datemention
            });

            if (recipients?.length) {
                const previewMessage = message.length > 120 ? `${message.slice(0, 117)}...` : message;

                await publishNotificationToRecipients({
                    recipients,
                    sender: userId,
                    type: "Mention",
                    title: "New Mention",
                    message: `${senderUser?.fullname || "Someone"} mentioned you: ${previewMessage}`,
                    entity: {
                        type: "Mention",
                        id: mention._id,
                    },
                    isRead: false,
                });
            }

            const returnData = await Mention.aggregate([
                {
                    $match: {
                        _id: mention._id
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "recipients",
                        foreignField: "_id",
                        as: "recipients"
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "sender",
                        foreignField: "_id",
                        as: "sender"
                    }
                },
                {
                    $unwind: {
                        path: "$sender",
                        preserveNullAndEmptyArrays: true,
                    }
                },
            ])

            return returnData[0];
        },
        addReply: async (_, { mentionId, sender, message }, context) => {
            const userId = sender || context?.user?.id;

            if (!userId) {
                throw new Error("User ID is required to add a reply");
            }

            const existingMention = await Mention.findById(mentionId).populate("sender");

            if (!existingMention) {
                throw new Error("Mention not found");
            }

            const mention = await Mention.findByIdAndUpdate(
                mentionId,
                {
                    $push: {
                        replies: {
                            sender: userId,
                            message,
                            createdAt: new Date(),
                        },
                    },
                },
                { new: true }
            );

            const replySender = await User.findById(userId);
            const originalSenderId = existingMention.sender?._id?.toString() || existingMention.sender?.toString();
            const isReplyFromOriginalSender = originalSenderId === userId.toString();

            if (!isReplyFromOriginalSender && originalSenderId) {
                const previewMessage = message.length > 120 ? `${message.slice(0, 117)}...` : message;

                await publishNotificationToRecipients({
                    recipients: [originalSenderId],
                    sender: userId,
                    type: "Mention",
                    title: "Mention Reply",
                    message: `${replySender?.fullname || "Someone"} replied to your mention: ${previewMessage}`,
                    entity: {
                        type: "Mention",
                        id: mention._id,
                    },
                    isRead: false,
                });
            }

            return mention;
        },
    }
}

const getMentionsWithUsers = async (matchCondition) => {
    return Mention.aggregate([
        {
            $match: matchCondition
        },
        {
            $lookup: {
                from: "users",
                localField: "recipients",
                foreignField: "_id",
                as: "recipients"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "sender",
                foreignField: "_id",
                as: "sender"
            }
        },
        {
            $unwind: {
                path: "$sender",
                preserveNullAndEmptyArrays: true,
            }
        },
        {
            $sort: {
                datemention: 1,
                createdAt: 1,
            }
        }
    ]);
};

const getDateRange = (dateInput) => {
    const date = new Date(dateInput);

    if (isNaN(date)) {
        throw new Error("Invalid date format");
    }

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return { start, end };
};
