//userdata = fulname, department,role,email,username,password
export const userSchema = `#graphql
    
    type User {
        id: ID
        fullname: String
        department: String
        role: String
        position: String
        email: String
        createdAt: String
        updatedAt: String
    }

    type Query {
        users: [User]!
        user(id: ID!): Response!
        searchUser(fullname: String, email: String,position: String, department: String, role: String): [User!]!
    }

    type Response {
        message: String!
        user: User!
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
        ): Response!
    }
`;