import bcrypt from "bcrypt";
import authModel from "../models/authModel.js";

const addSubMember = async (req, res) => {
    try {
        const {
            username,
            email,
            password,
            phone,
            age,
            shopName,
            shopAddress,
            city,
            state,
            pincode,
            profilePicture,
        } = req.body;

        if (
            !username ||
            !email ||
            !password ||
            !phone ||
            !shopName
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Username, email, password, phone and shop name are required",
            });
        }

        const normalizedEmail =
            email.trim().toLowerCase();

        const existingUser =
            await authModel.findOne({
                email: normalizedEmail,
            });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message:
                    "An account with this email already exists",
            });
        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const subAdmin =
            await authModel.create({
                username: username.trim(),
                email: normalizedEmail,
                password: hashedPassword,
                phone: String(phone),
                age: age || "",
                shopName: shopName.trim(),
                shopAddress: shopAddress || "",
                city: city || "",
                state: state || "",
                pincode: pincode || "",
                profilePicture:
                    profilePicture || "",
                role: "subAdmin",
                isActive: true,
            });

        return res.status(201).json({
            success: true,
            message:
                "Subadmin created successfully",
            user: {
                id: subAdmin._id,
                username: subAdmin.username,
                email: subAdmin.email,
                phone: subAdmin.phone,
                shopName: subAdmin.shopName,
                role: subAdmin.role,
                isActive: subAdmin.isActive,
            },
        });
    } catch (error) {
        console.error(
            "ADD SUBADMIN ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server Internal Error",
        });
    }
};

export default addSubMember;
