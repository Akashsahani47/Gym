import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
const connectDB = async () =>{
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: "GYM"
    })
    console.log(`MongoDB is connected`)
  } catch (error) {
    console.log({
      success:false,
      message:"Error in the database connection",
      uri:process.env.MONGO_URI,
      error:error.message
    })
  }
}
export default connectDB; 