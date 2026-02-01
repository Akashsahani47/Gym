import express from 'express';

import { verifyToken } from "../middleware/authmiddleware.js";
import { getCurrentUser, login, logout, signUp } from '../controller/authController.js';


const router = express.Router();

// Public routes
router.post('/signup', signUp);
router.post('/login', login);

// Protected routes
router.post('/logout', verifyToken, logout);
router.get('/me', verifyToken, getCurrentUser);

export default router;