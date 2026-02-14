// title, description, project, assignedTo, priority, status, dueDate
const taskSchema = `#graphql
    type Task {
        id: ID!
        title: String!
        description: String
        project: Project
        assignedTo: User
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
            assignedTo: ID
        ): Task
    }
`;

export default taskSchema;
