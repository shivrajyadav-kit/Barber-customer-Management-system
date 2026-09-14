import authModel from "../models/authModel.js";
import bcrypt from "bcryptjs";

const resetPassword = async(req, res) => {
    try {
        const {token} = req.params;
        const {newPassword, confirmPassword}= req.body;
         
    if(!newPassword || !confirmPassword){
        return res.status(400).json({
            message: "Fill the required feilds."
        });
    };
    if(newPassword !== confirmPassword){
        return res.status(400).json({message: "Passwords do not match."})
    }
    const user = await authModel.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now()},
    });
    if(!user){
        return res.status(400).json({message: "Invalid or esxpired reset link."})
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = newPassword;
    await user.save();

    return res.status(200).json({message: "Sucessfully your new password created." })
    
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Server error"})
    }
}

export default resetPassword;