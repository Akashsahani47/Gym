import express from 'express';

import { verifyToken } from "../middleware/authMiddleware.js";
import { getCurrentUser, login, logout, signUp, forgotPassword, resetPassword } from '../controller/authController.js';


const router = express.Router();

// Public routes
router.post('/signup', signUp);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.post('/logout', verifyToken, logout);
router.get('/me', verifyToken, getCurrentUser);

export default router;