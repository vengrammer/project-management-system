export const projectMgntSchema = `#graphql
    type ProjectMgnt {
            _id: ID
            title: String
            pm: User
            priority: String
            status: String
            departments: [Department]
            managers: [User]
            projects: [Project]
            isArchive: Boolean
            startDate: String
            endDate: String
        }

        type Message {
            message: String
            projectMgnt: ProjectMgnt
        }

        type Query {
            projectMgnts: [ProjectMgnt]
            projectMgnt(id: ID!) : ProjectMgnt
            projectMgntByPm(id: ID): [ProjectMgnt]
            projectsMgntByManager(id: ID): [ProjectMgnt]
            projectsMgntByArchive: [ProjectMgnt]
        }

        

        type Mutation {
            createProjectMgnt(
                title: String!
                pm: ID!
                priority: String
                departments: [ID]
                managers: [ID]
                projects: [ID]
                startDate: String
                endDate: String
        ): Message
    }
`