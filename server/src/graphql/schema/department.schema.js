//name, members, description,isActive,cretedby

const departmentSchema = `#graphql
    type Department {
        id: ID
        name: String
        users: [User]
        description: [String]
        isActive: Boolean
        createdBy: String
        createdAt: String
        updatedAt: String
    }
    type Query{
        departments: [Department]!
    }
`;
export default departmentSchema