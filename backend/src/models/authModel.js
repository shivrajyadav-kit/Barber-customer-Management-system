import mongoose from "mongoose";

mongoose.connect("mongodb://localhost:27017/haircut");

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            trim: true,
        },

        password: {
            type: String,
            trim: true,
        },

        age: {
            type: String,
            trim: true,
        },

        phone: {
            type: String,
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
        },

        role: {
            type: String,
            enum: ["admin", "subAdmin", "user"],
            default: "user",
        },

        shopName: {
            type: String,
            trim: true,
            default: "",
        },

        shopAddress: {
            type: String,
            trim: true,
            default: "",
        },

        city: {
            type: String,
            trim: true,
            default: "",
        },

        state: {
            type: String,
            trim: true,
            default: "",
        },

        pincode: {
            type: String,
            trim: true,
            default: "",
        },

        profilePicture: {
            type: String,
            default: "",
        },

        isActive: {
            type: Boolean,
            default: true,
        },
        resetPasswordToken: {
            type: String,
            default: null
        },
        resetPasswordExpires: {
            type: Date,
            default: null
        },
        newPassword: {
            type: String,
            default: null
        },
        confirmPassword: {
            type: String,
            default: null,
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true
        },
        picture: {
            type: String
        },

    },
    {
        timestamps: true,
    }
);

const authModel = mongoose.model("userModel", userSchema);

export default authModel;
