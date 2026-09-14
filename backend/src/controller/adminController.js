import authModel from "../models/authModel.js";
import BookAppointmentModels from "../models/BookAppointment.models.js";

const adminStats = async (req, res) => {
    try {
        const [
            totalUsers,
            totalSubadmins,
            totalAdmins,
            totalBookings,
            pendingBookings,
            confirmedBookings,
        ] = await Promise.all([
            authModel.countDocuments({
                role: "user",
            }),

            authModel.countDocuments({
                role: "subAdmin",
            }),

            authModel.countDocuments({
                role: "admin",
            }),

            BookAppointmentModels.countDocuments(),

            BookAppointmentModels.countDocuments({
                status: "pending",
            }),

            BookAppointmentModels.countDocuments({
                status: "confirmed",
            }),
        ]);

        const paidBookings =
            await BookAppointmentModels.find({
                paymentStatus: "paid",
            }).select("price");

        const totalRevenue =
            paidBookings.reduce(
                (total, booking) =>
                    total +
                    Number(booking.price || 0),
                0
            );

        return res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalSubadmins,
                totalAdmins,
                totalBookings,
                pendingBookings,
                confirmedBookings,
                totalRevenue,
            },
        });
    } catch (error) {
        console.error(
            "ADMIN STATS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to fetch admin statistics",
        });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users =
            await authModel
                .find({
                    role: "user",
                })
                .select(
                    "-password -resetPasswordToken -resetPasswordExpires"
                )
                .sort({
                    createdAt: -1,
                });

        return res.status(200).json({
            success: true,
            users,
        });
    } catch (error) {
        console.error(
            "GET USERS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to fetch users",
        });
    }
};

const getAllSubadmins = async (req, res) => {
    try {
        const subadmins =
            await authModel
                .find({
                    role: "subAdmin",
                })
                .select(
                    "-password -resetPasswordToken -resetPasswordExpires"
                )
                .sort({
                    createdAt: -1,
                });

        return res.status(200).json({
            success: true,
            subadmins,
        });
    } catch (error) {
        console.error(
            "GET SUBADMINS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to fetch subadmins",
        });
    }
};

const getAllBookings = async (req, res) => {
    try {
        const bookings =
            await BookAppointmentModels
                .find()
                .populate(
                    "customer",
                    "username email phone profilePicture"
                )
                .sort({
                    createdAt: -1,
                });

        return res.status(200).json({
            success: true,
            bookings,
        });
    } catch (error) {
        console.error(
            "GET ALL BOOKINGS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to fetch bookings",
        });
    }
};

export {
    adminStats,
    getAllUsers,
    getAllSubadmins,
    getAllBookings,
};