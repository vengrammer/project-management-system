import express from "express";
import  AdminRouter  from "./routers/admin.route.js";
import EmployeeRouter  from "./routers/employee.route.js";
import testingRouter from "./routers/testing.route.js";

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Admin routes
app.use("/api/admin", AdminRouter);
app.use("/api/employee", EmployeeRouter);
app.use("/api/testing", testingRouter);

export default app;
