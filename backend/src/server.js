import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRouter from "./router/auth.js";
import gymRouter from  "./router/gym.js"
const app = express();
const port = process.env.PORT || 4000;



app.use(cors({
  origin: 'http://localhost:3000', // Your Next.js frontend URL
  credentials: true, // If you need to send cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
connectDB();


app.use(express.json());

app.use('/api/auth',authRouter)
app.use('/api/gym',gymRouter)




app.get("/",(req,res)=>{
  res.json(
    {success:true,
    message:"Server is running successfully"
    });
})

app.listen(port,()=>{
  console.log(`Server is running on port:-http://localhost:${port}`)
})