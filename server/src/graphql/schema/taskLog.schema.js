// TaskLog GraphQL Schema

const taskLogSchema = `#graphql
    enum TaskStatus {
        in_progress
        done
        stuck
    }

    type TaskLog {
        id: ID!
        content: String!
        task: Task!
        status: TaskStatus!
        author: User!
        createdAt: String!
        updatedAt: String!
    }

    type Query {
        taskLogs: [TaskLog]
        taskLogsByTask(taskId: ID!): [TaskLog]
        taskLogsByProject(projectId: String!, startDate: String, endDate: String): [TaskLog]
        taskLog(id: ID!): TaskLog
    }

    type Mutation {
        createTaskLog(
            content: String!
            task: ID!
            status: TaskStatus!
            author: ID!
        ): TaskLog

        updateTaskLog(
            id: ID!
            content: String
            status: TaskStatus
        ): TaskLog

        deleteTaskLog(id: ID!): TaskLog
    }
`;

export default taskLogSchema;
