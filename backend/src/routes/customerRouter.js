import express from "express";
import {bookApointment, updateStatus,allCustomer} from "../controller/bookApointment.js";
import authMiddleware from "../middleware/middleware.js";
import getBokking from "../controller/userDashboardController.js";
import { getAllUsers } from "../controller/adminController.js";

const customerRouter = express.Router();

customerRouter.post('/book-appointment',authMiddleware,bookApointment);
customerRouter.patch('/status/:id',authMiddleware,updateStatus);
customerRouter.get('/all-customer',authMiddleware,allCustomer);
customerRouter.get("/users",authMiddleware,getAllUsers);
customerRouter.get("/my-bookings",authMiddleware,getBokking);
export default customerRouter;