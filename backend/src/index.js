import express from "express";
import router from "./routes/authRoute.js";
import adminRoute from "./routes/adminRouter.js";
import customerRouter from "./routes/customerRouter.js";
import contactRoute from "./routes/contactRoute.js";
import userDashRouter from "./routes/userDashboardRoute.js"
import cors from 'cors';
import cookieParser from "cookie-parser";
import path from "path";
import "dotenv/config";
import googleLoginRouter from "./routes/googleLogin.js"
import paymentRouter from "./routes/paymentRoute.js"
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",],
    allowedHeaders: ["Content-Type", "Authorization", "token"],
    credentials: true,
  })
);

app.use(
  "/uploads",
  express.static(
    path.join(process.cwd(), "uploads")
  )
);

app.use("/api/v1", router);
app.use("/api/admin", adminRoute);
app.use("/api/customer", customerRouter);
app.use("/api/contact", contactRoute);
// app.use("/api/my-bookings",userDashRouter);
app.use("/api/v1", googleLoginRouter);
app.use("/api/payment",paymentRouter);

app.listen(3000, () => {
  console.log(`Db Connected on port `)
});