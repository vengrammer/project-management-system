import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";

//import for the schema
import { userSchema } from "./schema/user.schema.js";
import { projectSchema } from "./schema/project.schema.js";
import departmentSchema from "./schema/department.schema.js";
import taskSchema from "./schema/task.schema.js";
import taskLogSchema from "./schema/taskLog.schema.js";


//import for the resolver
import { userResolvers } from "./resolver/user.resolver.js";
import { projectResolvers } from "./resolver/project.resolver.js";
import { departmentResolver } from "./resolver/department.resolver.js";
import taskResolver from "./resolver/task.resolver.js";
import taskLogResolver from "./resolver/tasklog.resolver.js";



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
  taskSchema,
  taskLogSchema,
]);
const resolvers = mergeResolvers([
  userResolvers,
  projectResolvers,
  departmentResolver,
  taskResolver,
  taskLogResolver,
]);
 
export { typeDefs, resolvers };
