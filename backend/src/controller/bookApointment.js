import BookAppointmentModels from "../models/BookAppointment.models.js";

const servicePrices = {
    "Classic Haircut": 300,
    "Haircut + Beard": 450,
    "Beard Trim": 200,
    "Hair Styling": 350,
    "Hair Spa": 600,
    "Head Massage": 400,
    "Premium Haircut": 500,
    "Beard Styling": 300,
};

const bookApointment = async (req, res) => {
    try {
        const {
            customername,
            age,
            contact,
            address,
            gender,
            service,
            barber,
            date,
            time,
        } = req.body;

        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message:
                    "User is not authenticated",
            });
        }

        if (
            !customername ||
            !contact ||
            !service ||
            !date ||
            !time
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please fill all required booking fields",
            });
        }

        const price =
            servicePrices[service];

        if (!price) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid service selected",
            });
        }

        const booking =
            await BookAppointmentModels.create({
                customername,
                age,
                contact,
                address,
                gender,
                service,
                barber,
                date: new Date(date),
                time,
                customer: req.userId,
                price,
                paymentStatus: "pending",
                status: "pending",
            });

        return res.status(201).json({
            success: true,
            message:
                "Appointment booked successfully",
            bookingId: booking._id,
            amount: booking.price,
            booking,
        });
    } catch (error) {
        console.error(
            "BOOKING ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to book appointment",
        });
    }
};

const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatus = [
            "pending",
            "confirmed",
            "cancelled",
            "done",
        ];

        if (
            !allowedStatus.includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid booking status",
            });
        }

        const booking =
            await BookAppointmentModels.findByIdAndUpdate(
                id,
                {
                    status,
                },
                {
                    new: true,
                }
            ).populate(
                "customer",
                "username email phone"
            );

        if (!booking) {
            return res.status(404).json({
                success: false,
                message:
                    "Booking not found",
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Booking status updated successfully",
            booking,
        });
    } catch (error) {
        console.error(
            "UPDATE STATUS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to update booking status",
        });
    }
};

const allCustomer = async (req, res) => {
    try {
        const data = await BookAppointmentModels
            .find()
            .populate(
                "customer",
                "username email phone profilePicture"
            )
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data,
        });

    } catch (error) {
        console.error("ALL CUSTOMER ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch bookings",
        });
    }
};

export {
    bookApointment,
    updateStatus,
    allCustomer,
};
