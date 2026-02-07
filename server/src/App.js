import express from "express";
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Admin routes

export default app;