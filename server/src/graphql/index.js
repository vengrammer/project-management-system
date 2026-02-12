import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";

//import for the schema
import { userSchema } from "./schema/user.schema.js";
import { projectSchema } from "./schema/project.schema.js";
import departmentSchema from "./schema/department.schema.js";

//import for the resolver
import { userResolvers } from "./resolver/user.resolver.js";
import { projectResolvers } from "./resolver/project.resolver.js";
import { departmentResolver } from "./resolver/department.resolver.js";


const rootSchema = `
  type Query{
    _empty: String
  }
  type Mutation{
    _empty: String
  }`;

const typeDefs = mergeTypeDefs([
  rootSchema,
  userSchema,
  projectSchema,
  departmentSchema,
]);
const resolvers = mergeResolvers([
  userResolvers,
  projectResolvers,
  departmentResolver,
]);
 
export { typeDefs, resolvers };
