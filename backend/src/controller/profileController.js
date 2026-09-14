import { json } from "express";
import userModel from "../models/authModel.js"


const userProfile = async (req, res) => {
    try {
        

        let user = await userModel.findById(req.userId).select("-password");
        if (!user) {
            user = await googleModel.findById(req.userId);
            
        }
        if(!user){
            return res.status(404).json({ message: "user not found" })
        }

        return res.status(200).json({ user })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error",
        });
    }
}

const updateProfile = async (req, res) => {
    try {
        const username = req.body.username;
        const email = req.body.email;
        const phone = req.body.phone;
        const updateData = {};

        if (username !== undefined) {
            if (!username.trim()) {
                return res.status(404).json({ message: "Username cannot be empty" })
            }
            updateData.username = username.trim();
        }
        if(email !== undefined){
            updateData.email = email.trim();
        }
        if(phone !== undefined){
            updateData.phone = phone.trim();
        }
        if (req.file) {
    
            updateData.profilePicture = `/uploads/${req.file.filename}`;
        }


        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "Nothing to update" })
        }
        const user = await userModel.findByIdAndUpdate(req.userId, updateData,
            {
                
                returnDocument: "after",
                runValidators: true,
            }
        ).select("-password");
        if (!user) {
            return res.status(404).json({ message: "user not found" })
        }

        return res.status(200).json({ message: "Profile updated succesfully", user })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server  error" })
    }
}


export { userProfile, updateProfile };