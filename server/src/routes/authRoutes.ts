import express from 'express';
import dotenv from 'dotenv';
// Import the correct controller functions
import { registerUser, loginUser, getAuthStatus } from '../controllers/authController';
// Import the JWT protection middleware
import { protect } from '../middleware/authMiddleware';

dotenv.config();
const router = express.Router();

// --- Public Routes ---

// POST /api/auth/register
router.post('/register', registerUser);

// POST /api/auth/login
router.post('/login', loginUser);

// --- Protected Routes ---

// GET /api/auth/status
// This route now requires a valid JWT. The 'protect' middleware runs first.
// If the token is valid, 'protect' adds req.user, then calls getAuthStatus.
// If the token is invalid or missing, 'protect' sends a 401 response directly.
router.get('/status', protect, getAuthStatus);

// --- Removed Routes ---
// GitHub routes are removed.
// Logout is handled client-side (removing token), no backend route needed by default.

export default router;

