// title, description, project, users, priority, status, dueDate
const taskSchema = `#graphql
    type Task {
        id: ID!
        title: String
        description: String
        project: Project
        users: [User]
        priority: String
        status: String
        dueDate: String
    }
    type Query {
        task(id: ID!): Task
        tasks: [Task]
        taskByProject(id: ID!): [Task]
    }
    type Mutation {
        createTask(
            title: String!
            description: String
            project: ID!
            priority: String
            status: String
            dueDate: String
            users: [ID]
        ): Task

        # Edit/update an existing task (alias of updateTask)
        editTask(
            id: ID!
            title: String
            description: String
            priority: String
            status: String
            dueDate: String
            users: [ID]
        ): Task

        updateTask(
            id: ID!
            title: String
            description: String
            priority: String
            status: String
            dueDate: String
            users: [ID]
        ): Task

        deleteTask(
            id: ID!
        ): Task
    }
`;

export default taskSchema;
