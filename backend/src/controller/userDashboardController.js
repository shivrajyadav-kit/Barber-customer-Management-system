
import BookAppointmentModels from "../models/BookAppointment.models.js";

const getBokking = async (req, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const bookings =
            await BookAppointmentModels.find({
                customer: req.userId,
            }).sort({
                createdAt: -1,
            });

        return res.status(200).json({
            success: true,
            bookings,
        });
    } catch (error) {
        console.error("MY BOOKINGS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load bookings",
        });
    }
};


export default getBokking;