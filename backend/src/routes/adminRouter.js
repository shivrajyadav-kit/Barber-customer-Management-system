import express from "express";
import addSubMember from "../controller/addSubMember.js";
import {
    adminStats,
    getAllUsers,
    getAllSubadmins,
    getAllBookings,
} from "../controller/adminController.js";

import authMiddleware from "../middleware/middleware.js";

const adminRoute = express.Router();

adminRoute.post(
    "/add-member",
    authMiddleware,
    addSubMember
);

adminRoute.get(
    "/stats",
    authMiddleware,
    adminStats
);

adminRoute.get(
    "/users",
    authMiddleware,
    getAllUsers
);

adminRoute.get(
    "/subadmins",
    authMiddleware,
    getAllSubadmins
);

adminRoute.get(
    "/bookings",
    authMiddleware,
    getAllBookings
);

export default adminRoute;
