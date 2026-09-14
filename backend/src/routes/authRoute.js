import express from "express";
import { forgotPassword, logout, signIn, signUp } from "../controller/authController.js";
import { updateProfile, userProfile } from "../controller/profileController.js";
import authMiddleware from "../middleware/middleware.js";
import upload from "../controller/uploadMiddleware.js";
import resetPassword from "../controller/resetpassword.js";


const router = express.Router();

router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/logout',logout)
router.get("/profile", authMiddleware, userProfile);
router.put("/update-profile", authMiddleware,
    upload.single("profilePicture"),
    updateProfile
);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
export default router;