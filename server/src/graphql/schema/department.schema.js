//name, description,isActive

const departmentSchema = `#graphql
    type Department {
        id: ID!
        name: String
        users: [User]
        description: String
        isActive: Boolean
        createdAt: String
        updatedAt: String
    }
    type ReturnMessage {
        message: String
        department: Department
    }

    type Query{
        departments: [Department]!
        department(id: ID): Department
    }
    
    type Mutation {
        createDepartment(
            name: String!
            description: String
            isActive: Boolean
        ): ReturnMessage!

        deleteDepartment(id: ID!): ReturnMessage
    }
`;
export default departmentSchema