import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import cors from "cors";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { typeDefs, resolvers } from "./graphql/index.js";

import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/use/ws";
import { makeExecutableSchema } from "@graphql-tools/schema";
import http from "http";

dotenv.config();

const app = express();

// =========================
// GraphQL Schema


const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// =========================
// Apollo Server


const server = new ApolloServer({
  schema,
});

await server.start();

// =========================
// CORS


const allowedOrigins = [
  "http://localhost:5173",
  "https://projectmanagement-client-pbe5.onrender.com",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// =========================
// Body Parser

app.use(bodyParser.json());

// =========================
// GraphQL


app.use(
  "/graphql",
  expressMiddleware(server, {
    context: async ({ req }) => {
      const token = req.headers.authorization?.split(" ")[1];

      if (token) {
        try {
          const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET,
          );

          return {
            user: decoded,
          };
        } catch (error) {
          console.error("Invalid token:", error);
        }
      }

      return {};
    },
  }),
);

// =========================
// HTTP Server


const httpServer = http.createServer(app);

// =========================
// WebSocket Server


const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
});

//=========================
 //GraphQL WebSocket


useServer(
  {
    schema,

    context: async (ctx) => {
      const auth =
        ctx.connectionParams?.authorization ||
        ctx.connectionParams?.Authorization;

      if (auth) {
        try {
          const token = auth.replace("Bearer ", "");

          const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET,
          );

          return {
            user: decoded,
          };
        } catch (error) {
          console.error("Invalid WebSocket token:", error);
        }
      }

      return {};
    },
  },
  wsServer,
);

export default httpServer;