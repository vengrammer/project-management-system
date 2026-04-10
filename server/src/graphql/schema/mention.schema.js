//project =  projectmanager,users, title,description,priority,status,department,progress,tags,budget,startdate,endate,timestamps
const mentionSchema = `#graphql
    type Reply {
        _id: ID
        message: String
        sender: User
        createdAt: String
    }

    type Mention {
        _id: ID
        recipients: [User]
        datemention: String
        sender: User
        message: String
        replies: [Reply]
        readBy: [User]
        createdAt: String
        updatedAt: String
    }

    type Query {
        mentionsByDateMention(datemention: String
            userId: ID
            isSender: Boolean
        ): [Mention]
        
        mentions: [Mention]
        mention(id: ID!): Mention
        mentionsByUser(userId: ID!): [Mention]
        mentionsBySender(senderId: ID): [Mention]
        mentionsByRecipient(recipientId: ID): [Mention]
    }

    type Mutation {
        createMention(
            recipients: [ID]
            sender: ID
            message: String
            datemention: String
        ): Mention

        addReply(
            mentionId: ID
            sender: ID
            message: String
        ): Mention

        deleteReply(
            mentionId: ID
            replyId: ID
        ): Mention

        updateMention(
            id: ID
            message: String
        ): Mention

        deleteMention(id: ID!): Boolean

        markAsRead(
            mentionId: ID
            userId: ID
        ): Mention
    }

`;

export default mentionSchema;
