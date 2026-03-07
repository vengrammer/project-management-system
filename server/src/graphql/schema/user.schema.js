
export const userSchema = `#graphql
    type User {
        id: ID
        fullname: String
        department: Department
        role: String
        position: String
        email: String
        username: String
        status: Boolean
        createdAt: String
        updatedAt: String
    }
    
    type ReturnMessage {
        message: String
        user: User!
    }

    type AuthPayLoad {
        token: String!
        user: User!
    }

    type Query {
        users: [User]!
        userRoleManager: [User]
        user(id: ID!): User
        currentUser: User # fetch the logged-in user (based on context)
        usersWithID(id: [String]) : [User]
        searchUser(fullname: String, email: String, position: String, department: String, role: String): [User]!
    }

    type Message {
        message: String
    }

    type Mutation {
        login(username: String!, password: String!): AuthPayLoad
        logout: Message
        createUser(
            fullname: String!
            email: String!
            password: String!
            position: String!
            username: String!
            status: Boolean!
            department: ID!
            role: String
        ): ReturnMessage!

        updateUser(
            id: ID!
            fullname: String
            email: String
            password: String
            position: String
            username: String
            status: Boolean
            department: ID
            role: String
        ): ReturnMessage!

        deleteUser(id: ID!): User
        deactivateUser(id: ID!): User
    }
`;
