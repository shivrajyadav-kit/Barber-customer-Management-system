import mongoose from "mongoose";

const addMemberSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "userModel",
            required: true,
        },

        username: {
            type: String,
            trim: true,
            required: true,
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
            required: true,
        },

        password: {
            type: String,
            required: true,
        },

        phone: {
            type: Number,
            required: true,
        },

        age: {
            type: String,
            trim: true,
        },

        shopName: {
            type: String,
            trim: true,
            required: true,
        },

        shopAddress: {
            type: String,
            trim: true,
        },

        city: {
            type: String,
            trim: true,
        },

        state: {
            type: String,
            trim: true,
        },

        pincode: {
            type: String,
            trim: true,
        },

        profilePicture: {
            type: String,
            default: "",
        },

        role: {
            type: String,
            enum: ["subAdmin"],
            default: "subAdmin",
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model(
    "addMemberModel",
    addMemberSchema
);
