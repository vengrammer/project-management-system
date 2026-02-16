//project =  projectmanager,users, title,description,priority,status,department,progress,tags,budget,startdate,endate,timestamps
export const projectSchema = `#graphql
      type Project {
        id: ID!
        title: String
        description: String
        priority: String
        status: String
        client: String
        department: Department
        projectManager: User
        users: [User]
        budget: Int
        startDate: String
        endDate: String
    }
    type Query {
        projects: [Project]!
        project(id: ID!) : Project
    }
    type Message {
        message: String
        project: Project
    }
    type Mutation {
        createProject(
            title: String!
            description: String
            client: String
            priority: String
            status: String
            department: ID
            budget: Int
            projectManager: ID
            users: [ID]
            startDate: String
            endDate: String
        ): Message

        updateProject(
            id: ID!
            title: String
            description: String
            client: String
            priority: String
            status: String
            department: ID
            budget: Int
            projectManager: ID
            users: [ID]
            addUsers: [ID]
            removeUsers: [ID]
            startDate: String
            endDate: String
        ): Message
    }
`;
