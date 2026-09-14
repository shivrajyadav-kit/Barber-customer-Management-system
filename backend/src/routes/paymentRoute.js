import express from "express";
import {createOrder, verifyOrder} from "../controller/paymentController.js";
import authMiddleware from "../middleware/middleware.js";

const router = express.Router();
router.post("/create-payment",authMiddleware,createOrder);
router.post("/verify-payment",authMiddleware,verifyOrder);
export default router;