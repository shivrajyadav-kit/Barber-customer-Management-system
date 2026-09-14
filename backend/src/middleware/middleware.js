import Jwt from "jsonwebtoken";

function authMiddleware(req, res, next) {
    try {
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({
                message: "Authentication token is required",
            });
        }

        const decoded = Jwt.verify(
            token,
            process.env.JWT_AUTH_SECRET
        );

        if (!decoded.userId) {
            return res.status(403).json({
                message: "Token is incorrect",
            });
        }

        req.userId = decoded.userId;

        next();
    } catch (error) {
        console.error("JWT Error:", error.message);

        return res.status(401).json({
            message: "Invalid or expired token",
        });
    }
}

export default authMiddleware;
