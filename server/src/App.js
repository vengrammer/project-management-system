import express from "express";
import {ApolloServer} from "@apollo/server";
import {expressMiddleware} from "@as-integrations/express5";
import cors from "cors";
import bodyParser from "body-parser";
import { typeDefs, resolvers } from "./graphql/index.js";

const app = express();

//use the typedefs and resolver fromm graphql/index.js
const server = new ApolloServer({
    typeDefs,
    resolvers,
});

await server.start();

// Middleware to parse JSON
app.use(express.json());

// use the graphql endpoint
app.use("/graphql", cors(), bodyParser.json(), expressMiddleware(server));
export default app;