import userModel from "../models/authModel.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";
import jwt from 'jsonwebtoken';
import authModel from "../models/authModel.js";
import redisClient from "../utils/redisConfig.js";


const signUp = async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    const phone = req.body.phone;
    const role = req.body.role;

    const existingUser = await userModel.findOne({
        username: username,
        password: password,
        email: email,
        phone: phone
    });
    if (existingUser) {
        return res.status(403).json({
            message: "User with this username already exits"
        })
    }
    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await userModel.create({
        username: username,
        password: hashedPassword,
        email: email,
        phone: phone,
        role: role
    })
    res.json({
        id: newUser._id
    })
}

const signIn = async (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    const userExist = await userModel.findOne({
        username: username,

    });
    if (!userExist) {
        return res.status(403).json({
            message: "Incorrect credentials"
        })

    }
    const isVailedPassword = await bcrypt.compare(password, userExist.password);
    if (!isVailedPassword) {
        return res.status(403).json({
            message: "Password Incoorect"
        })
    }

    const token = jwt.sign({
        userId: userExist._id,
        role: userExist.role
    }, process.env.JWT_AUTH_SECRET,
        {
            expiresIn: "1d"
        }
    );
    redisClient.set(
        `token:${token}`,
        JSON.stringify({
            userId: userExist._id,
            role: userExist.role
        }),
        {
            EX: 24 * 60 * 60
        }
    )
    res.cookie(
        "token",
        token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000
    }

    )

    return res.status(200).json({
        message: "LoggedIn Successfully",

        token:token,

        user: {
            id: userExist._id,
            username: userExist.username,
            email: userExist.email,
            phone: userExist.phone,
            role: userExist.role,
        }
    })
}

const logout = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (token) {
            await redisClient.del(`token:${token}`)
        }
        res.clearCookie("token",
            {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        }
        )
        return res.status(200).json({
            message: "Logged out succesfully"
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Logout Failed"
        })
    }
}


const forgotPassword = async (req, res) => {
    try {
        const email = req.body.email;
        if (!email) {
            return res.status(400).json({ message: "Email is required" })
        }
        const user = await authModel.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "If an account exists with this email, a reset link has been sent.",

            });
        }
        const resetToken = await crypto.randomBytes(32).toString("hex");

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
        await user.save();
        const resetUrl = `${process.env.BASE_URL}/reset-password/${resetToken}`;



        const trnasporter = nodemailer.createTransport(
            {

                service: 'gmail',


                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASSWORD
                }
            });

        const mailOption = {
            from: process.env.EMAIL,
            to: user.email,
            subject: "Cut & Style",
            text: `Please click on the follwing  link: ${resetUrl}`
        }
        console.log("User email:", user.email);

        await trnasporter.sendMail(mailOption);
        return res.status(200).json({
            message: "If an account exists with this email, a reset link has been sent."
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong, Please try again"
        })
    }
}

export { signIn, signUp, forgotPassword,logout };