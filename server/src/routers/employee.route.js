import express from "express";
import { testing } from "../controllers/employee.controller.js";

const employeeRouter = express.Router();

employeeRouter.get("/testing", testing);

export default employeeRouter;