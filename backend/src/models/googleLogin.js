import mongoose from "mongoose";

const googleLoginSchema = new mongoose.Schema(
    {
        googleId:{ 
        type: String,
        unique:true,
        sparse:true
    },
    name: {
        type:String,
        required:true
    },
    email: {
        type:String,
        required:true,
    },
    picture: {
        type:String
    },
    role: {
            type: String,
            enum: ["user", "admin", "subadmin"],
            default: "user",
        },
},{timestamps: true}
);

export default mongoose.model("User", googleLoginSchema);