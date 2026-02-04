import express from "express";
//import { testing } from "../controllers/admin.controller.js";
import { createAccount } from "../controllers/admin.controller.js";

const adminRouter = express.Router();

// POST /api/admin/create-account
adminRouter.post("/create-account", createAccount);

export default adminRouter;