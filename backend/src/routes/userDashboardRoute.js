import authMiddleware from "../middleware/middleware.js";
import express from "express";
import getBokking from "../controller/userDashboardController.js";


const userDashRouter = express.Router();

userDashRouter.get("/", authMiddleware,getBokking);

export default userDashRouter;