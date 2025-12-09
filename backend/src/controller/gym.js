import { GymOwner } from "../model/GymOwner.js";

export const Allgym = async (req, res)=>{
  try {
    const Gyms = await GymOwner.find();
    return res.status(200).json({sucess:true,message:"All Gym fetched",Gyms})
  } catch (error) {
    return res.status(500).json({success:false,message:"Internal error",error:message.error })
  }
}