//userdata = fulname, department,role,email,username,password
export const userSchema = `#graphql
    type User {
        id: ID
        fullname: String
        department: Department
        role: String
        position: String
        email: String
        status: String
        createdAt: String
        updatedAt: String
    }
    type ReturnMessage {
        message: String
        user: User!
    }

    type Query {
        users: [User]!
        user(id: ID!): User
        searchUser(fullname: String, email: String,position: String, department: String, role: String): ReturnMessage!
    }

    type Mutation {
        createUser(
            fullname: String!
            email: String!
            password: String!
            position: String!
            username: String!
            department: String!
            role: String!
        ): ReturnMessage!
    }
`;
