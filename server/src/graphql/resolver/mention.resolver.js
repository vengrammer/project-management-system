import Mention from "../../model/mentions.model.js"
import User from "../../model/user.model.js"
import mongoose from "mongoose";

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
            console.log("senderId:", senderId);
            const userId = senderId || context?.user?.id;
            if (!userId) {
                throw new Error("User ID is required to fetch projects");
            }

            const mentions = await Mention.find({ sender: userId });
            return mentions;
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

            const mentions = await Mention.aggregate([
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
                }
            ]);

            return mentions;
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
            const mention = await Mention.create({
                sender: userId,
                recipients: recipients,
                message: message,
                datemention: datemention
            });

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

            if (!mention) {
                throw new Error("Mention not found");
            }

            return mention;
        },
    }
}

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
