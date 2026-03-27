import express from "express";
import { searchGyms, getGymBySlug, selfRegister } from "../controller/publicController.js";

const router = express.Router();

router.get("/gyms", searchGyms);
router.get("/gym/:slug", getGymBySlug);
router.post("/join/:slug", selfRegister);

export default router;
