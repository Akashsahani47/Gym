import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { createGym, deleteGym, getGymOwnerinfo, getOwnerGyms, updateGymOwnerinfo } from "../controller/gymOwner.js";

const router = express.Router();

router.get("/info", verifyToken, getGymOwnerinfo);
router.put("/updateinfo", verifyToken, updateGymOwnerinfo);
router.post("/addgyms", verifyToken, createGym)
router.get("/gyms",verifyToken, getOwnerGyms);
router.delete("/gyms/:id",verifyToken, deleteGym);
export default router;
