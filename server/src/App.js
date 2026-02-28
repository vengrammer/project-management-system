import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import cors from "cors";
import { typeDefs, resolvers } from "./graphql/index.js";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

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
app.use(
  "/graphql",
  cors(),
  bodyParser.json(),
  expressMiddleware(server, {
    context: async ({ req }) => {
      const token = req.headers.authorization?.split(" ")[1];
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          return { user: decoded };
        } catch (error) {
          console.log("Invalid to ken");
          return {}
        }
      }
      return {}
    },
  }),
);
export default app;
