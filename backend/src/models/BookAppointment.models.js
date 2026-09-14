import mongoose from "mongoose";

const bookAppointmentSchema = new mongoose.Schema(
    {
        customername: {
            type: String,
            required: true,
            trim: true,
        },

        age: {
            type: String,
            trim: true,
            default: "",
        },

        contact: {
            type: String,
            required: true,
            trim: true,
        },

        address: {
            type: String,
            trim: true,
            default: "",
        },

        gender: {
            type: String,
            enum: ["Male", "Female", "Other"],
            default: "Male",
        },

        service: {
            type: String,
            enum: [
                "Classic Haircut",
                "Haircut + Beard",
                "Beard Trim",
                "Hair Styling",
                "Hair Spa",
                "Head Massage",
                "Premium Haircut",
                "Beard Styling",
            ],
            default: "Classic Haircut",
        },

        barber: {
            type: String,
            enum: [
                "Any Barber",
                "John",
                "Mike",
                "Alex",
            ],
            default: "Any Barber",
        },

        date: {
            type: Date,
            required: true,
        },

        time: {
            type: String,
            enum: [
                "09:00 AM",
                "10:00 AM",
                "11:00 AM",
                "12:00 PM",
                "01:00 PM",
                "02:00 PM",
                "03:00 PM",
                "04:00 PM",
                "05:00 PM",
            ],
            required: true,
        },

        status: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "cancelled",
                "done",
            ],
            default: "pending",
        },

        paymentStatus: {
            type: String,
            enum: [
                "pending",
                "paid",
                "failed",
            ],
            default: "pending",
        },

        razorpayOrderId: {
            type: String,
            default: "",
        },

        razorpayPaymentId: {
            type: String,
            default: "",
        },

        razorpaySignature: {
            type: String,
            default: "",
        },

        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "userModel",
            required: true,
            index: true,
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model(
    "BookingModel",
    bookAppointmentSchema
);
