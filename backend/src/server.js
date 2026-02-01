import dotenv from "dotenv";
dotenv.config(); // ✅ MUST be first

import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";
import authRouter from "./router/auth.js";
import gymRouter from "./router/gym.js";
import gymOwnerRoutes from "./router/gymOwner.js"
const app = express();
const port = process.env.PORT || 4000;
import cookieParser from "cookie-parser";
/* ---------- MIDDLEWARE ---------- */
app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? process.env.NEXT_FRONTEND_URL
    : "http://localhost:3000",
  credentials: true,
}));


app.use(express.json());
app.use(cookieParser());

/* ---------- DATABASE ---------- */
connectDB();

/* ---------- ROUTES ---------- */
app.use("/api/auth", authRouter);
app.use("/api/gym", gymRouter);
app.use("/api/gym-owner", gymOwnerRoutes);


app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Server is running successfully",
  });
});

/* ---------- SERVER ---------- */
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
