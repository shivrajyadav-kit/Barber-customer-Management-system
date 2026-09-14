import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import userModel from "../models/authModel.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
    try {
        const { credential } = req.body
        
        console.log(credential)
        if (!credential) {
            return res.status(400).json({ message: "Google credential is required" })
        }
        // console.log(process.env.GOOGLE_CLIENT_ID)
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        console.log(payload)
        const { email, name, picture, sub: googleId } = payload;
        if (!email) {
            return res.status(400).json({ message: "Google account email not available" })
        }
        let user = await userModel.findOne({ email });
        console.log(user)
        if (!user) {
            user = await userModel.create({
                name,
                email,
                image: picture,
                googleId,
            });

        }
        const token = jwt.sign({
            userId: user._id,
            email: user.email,
        },
            process.env.JWT_AUTH_SECRET,
            {
                expiresIn: "7d",
            }
        )
        res.cookie(
        "token",
        token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000
        })
        
        return res.status(200).json({

            message: "successful Login",
            token,
            user: {
                id: user._id,
                googleId: user.googleId,
                name: user.name,
                email: user.email,
                picture: user.picture,
                role: user.role,
            },
        });


    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error
        })
    }
}

export default googleLogin;