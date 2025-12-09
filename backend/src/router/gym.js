import express from 'express'
import { Allgym } from '../controller/gym.js';

const router = express.Router();

router.get('/allgym',Allgym)

export default router;