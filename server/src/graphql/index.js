//import for the schema
import { userSchema } from "./schema/user.schema.js";

//import for the resolver
import { userResolvers } from "./resolver/user.resolver.js";

const typeDefs = `
  type Query
  type Mutation
  ${userSchema}
`;

const resolvers = {
  Query: {
    ...userResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
  },
};

export { typeDefs, resolvers };