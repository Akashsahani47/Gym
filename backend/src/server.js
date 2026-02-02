import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";
import authRouter from "./router/auth.js";
import gymRouter from "./router/gym.js";
import gymOwnerRoutes from "./router/gymOwner.js";

const app = express();
const port = process.env.PORT || 4000;

const allowedOrigins = [
  "http://localhost:3000",
  process.env.NEXT_FRONTEND_URL,
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server & Postman
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(cookieParser());


connectDB();

app.use("/api/auth", authRouter);
app.use("/api/gym", gymRouter);
app.use("/api/gym-owner", gymOwnerRoutes);

app.get("/", (req, res) => {
  res.json({ success: true, message: "Server running" });
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
