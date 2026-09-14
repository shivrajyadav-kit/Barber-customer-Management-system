import authModel from "../models/authModel.js";

const getAllUsers = async (req, res) => {
    try {
        const users = await authModel
            .find({ role: "user" })
            .select("-password -resetPasswordToken -resetPasswordExpires -newPassword -confirmPassword")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            totalUsers: users.length,
            users,
        });
    } catch (error) {
        console.error("GET USERS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch users",
        });
    }
};

export default getAllUsers;