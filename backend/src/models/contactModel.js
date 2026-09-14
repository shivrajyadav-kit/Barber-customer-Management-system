import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        trim: true,
        lowercase: true,

    },
    phone:{
        type: String,
        trim:true,
        default:""
    },
    message:{
        type:String,
        required:true,
        trim:true
    },
    status:{
        type:String,
        enum:["new","read","replied"],
        default:"new"
    },
},{timestamps: true});

const contactModel = mongoose.model("contact",contactSchema);

export default contactModel;