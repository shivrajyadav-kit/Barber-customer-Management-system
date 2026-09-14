import express from "express";
import googleLogin from "../controller/googleLogin.js";
import authMiddleware from "../middleware/middleware.js";

const router = express.Router();

router.post("/google",googleLogin);

export default router;