import Mention from "../../model/mentions.model.js"
import User from "../../model/user.model.js"

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
    }
}

