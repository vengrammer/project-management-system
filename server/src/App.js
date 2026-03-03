import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import cors from "cors";
import { typeDefs, resolvers } from "./graphql/index.js";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { blacklist } from "./graphql/resolver/user.resolver.js";
import User from "./model/user.model.js";
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
      const authHeader = req.headers.authorization;

      if (!authHeader) return {};

      const token = authHeader.split(" ")[1];

      if (blacklist.has(token)) {
        throw new Error("Token has been logged out / blacklisted");
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        console.log("Context user:", user);
        return { user, token };
      } catch (err) {
        return {};
      }
    },
  }),
);
export default app;
