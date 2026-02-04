import express from "express";
import { testing } from "../controllers/admin.controller.js";


const adminRouter = express.Router();


// GET /api/admin/testing
//adminRouter.get("/testing", testing);

// POST /api/admin/create
adminRouter.post("/create", testing);

export default adminRouter;