//content, task,status,author

const taskLogSchema = `#graphql
    type TaskLog {
        id: ID!
        content: String
        task: Task
        status: String
        author: User
    }
    type Query {
        taskLogs: [TaskLog]
    }
    type Mutation {
        createTaskLog(
            content: String!
            task: ID
            status: String!
            author: ID
        ): TaskLog
    }
`;
export default taskLogSchema;