// import BookAppointmentModels from "../models/BookAppointment.models.js";
// import razorpay from "../utils/razorpayConfig.js";
// import crypto from "crypto";


// const creareOrder = async (req, res) => {
//     try {
//         const { bookingId } = req.body;
//         if (!bookingId) {
//             return res.status(400).json({ message: "BookingId is required" })
//         }
//         const booking = await BookAppointmentModels.findOne({
//             _id: bookingId,
//             customer: req.userId
//         })
//         const options = {
//             amount: booking.price * 100,
//             currency: "INR",
//             receipt: `booking_${booking._id}`
//         };

//         const order = await razorpay.orders.create(options);

//         booking.razorpayOrderId = order.id;

//         await booking.save();

//         return res.status(200).json({
//             success: true,
//             order
//         });
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({
//             success: false,
//             message: "Unable to create payment"
//         })
//     }
// }

// const verifyOrder = async (req, res) => {
//     try {
//         const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

//         const booking = await BookAppointmentModels.findOne({ _id: bookingId, customer: req.userId })

//         if (!booking) {
//             return res.status(400).json({ message: "Booking not found" });
//         }
//         const body = razorpayOrderId + "|" + razorpayPaymentId;

//         const expectedSingnature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//             .update(body)
//             .digest("hex");

//         if (expectedSingnature !== razorpaySignature) {
//             booking.paymentStatus = "failed";
//             await booking.save();

//             return res.status(400).json({
//                 success: false,
//                 message: "Payment verification failed"
//             })
//         }
//         booking.paymentStatus = "paid";
//         booking.status = "confirmed";

//         await booking.save();

//         return res.status(200).json({
//             success: true,
//             message: "Payment succesfull",
//             bookingId: booking._id
//         })
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({
//             success: true,
//             message: "Payment verification failed"
//         })
//     }
// }

// export { creareOrder, verifyOrder };



import BookAppointmentModels from "../models/BookAppointment.models.js";
import razorpay from "../utils/razorpayConfig.js";
import crypto from "crypto";

// Create Razorpay Order
const createOrder = async (req, res) => {
    try {
        const { bookingId } = req.body;

        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: "Booking ID is required",
            });
        }

        const booking = await BookAppointmentModels.findOne({
            _id: bookingId,
            customer: req.userId,
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        // Don't create another order for an already-paid booking
        if (booking.paymentStatus === "paid") {
            return res.status(400).json({
                success: false,
                message: "Booking is already paid",
            });
        }

        const options = {
            amount: Math.round(booking.price * 100),
            currency: "INR",
            receipt: `booking_${booking._id}`,
        };

        const order = await razorpay.orders.create(options);

        booking.razorpayOrderId = order.id;
        booking.paymentStatus = "pending";

        await booking.save();

        return res.status(200).json({
            success: true,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
            },
        });

    } catch (error) {
        console.error("Create Razorpay order error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to create payment",
        });
    }
};


// Verify Razorpay Payment
const verifyOrder = async (req, res) => {
    try {
        const {
            bookingId,
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
        } = req.body;

        if (
            !bookingId ||
            !razorpayOrderId ||
            !razorpayPaymentId ||
            !razorpaySignature
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment details are required",
            });
        }

        const booking = await BookAppointmentModels.findOne({
            _id: bookingId,
            customer: req.userId,
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        // Make sure the order belongs to this booking
        if (booking.razorpayOrderId !== razorpayOrderId) {
            return res.status(400).json({
                success: false,
                message: "Invalid Razorpay order",
            });
        }

        // Generate signature
        const body = `${razorpayOrderId}|${razorpayPaymentId}`;

        const expectedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpaySignature) {
            booking.paymentStatus = "failed";

            await booking.save();

            return res.status(400).json({
                success: false,
                message: "Payment verification failed",
            });
        }

        // Get actual payment details from Razorpay
        const payment = await razorpay.payments.fetch(
            razorpayPaymentId
        );

        // Make sure payment belongs to our order
        if (payment.order_id !== razorpayOrderId) {
            return res.status(400).json({
                success: false,
                message: "Payment does not belong to this order",
            });
        }

        // Check payment status
        if (payment.status !== "captured") {
            return res.status(400).json({
                success: false,
                message: `Payment status is ${payment.status}`,
            });
        }

        // Check amount
        const expectedAmount = Math.round(booking.price * 100);

        if (payment.amount !== expectedAmount) {
            return res.status(400).json({
                success: false,
                message: "Payment amount mismatch",
            });
        }

        // Payment successful
        booking.paymentStatus = "paid";
        booking.status = "confirmed";
        booking.razorpayPaymentId = razorpayPaymentId;
        booking.razorpaySignature = razorpaySignature;
        booking.paymentMethod = payment.method || "upi";
        booking.paidAt = new Date();

        await booking.save();

        return res.status(200).json({
            success: true,
            message: "Payment successful",
            bookingId: booking._id,
        });

    } catch (error) {
        console.error("Verify Razorpay payment error:", error);

        return res.status(500).json({
            success: false,
            message: "Payment verification failed",
        });
    }
};

export {
    createOrder,
    verifyOrder,
};
