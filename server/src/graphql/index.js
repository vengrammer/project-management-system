import {mergeTypeDefs, mergeResolvers} from "@graphql-tools/merge"

//import for the schema
import { userSchema } from "./schema/user.schema.js";
import { projectSchema } from "./schema/project.schema.js";

//import for the resolver
import { userResolvers } from "./resolver/user.resolver.js";
import { projectResolvers } from "./resolver/project.resolver.js";

// const typeDefs = `
//   type Query
//   type Mutation
//   ${userSchema},
//   ${projectSchema}
// `;

// const resolvers = {
//   Query: {
//     ...userResolvers.Query,
//     ...projectResolvers.Query,
//   },
//   Mutation: {
//     ...userResolvers.Mutation,
//   },
// };

const rootSchema = `
  type Query{
    _empty: String
  }
  type Mutation{
    _empty: String
  }`;

const typeDefs = mergeTypeDefs([rootSchema,userSchema, projectSchema]);
const resolvers = mergeResolvers([userResolvers,projectResolvers]);

export { typeDefs, resolvers };