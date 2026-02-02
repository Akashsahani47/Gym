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


//   "http://localhost:3000",
//   "process.env.NEXT_FRONTEND_URL",
// ];

// app.use(cors({
//   origin: (origin, callback) => {
//     // Allow Postman / server requests
//     if (!origin) return callback(null, true);

//     if (allowedOrigins.includes(origin)) {
//       return callback(null, true);
//     }

//     // ❗ DO NOT throw error
//     return callback(null, false);
//   },
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
// }));



// app.use(cors({
//   origin: process.env.NEXT_FRONTEND_URL || "http://localhost:3000",
//   credentials: true, // Important for cookies
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
// }));
// app.use(express.json());
// app.use(cookieParser());

// console.log("✅ Allowed frontend:", process.env.NEXT_FRONTEND_URL);



const allowedOrigins = [
  "http://localhost:3000",
  process.env.NEXT_FRONTEND_URL, // https://gym-eight-dun.vercel.app
];

app.use(cors({
  origin: (origin, callback) => {
    console.log("🌐 Incoming origin:", origin);

    // Allow Postman / server-to-server
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("❌ Blocked by CORS:", origin);
    return callback(null, false); // DO NOT throw error
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
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
