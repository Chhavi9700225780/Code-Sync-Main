import { Request, Response /* REMOVE: NextFunction */ } from 'express'; // Remove NextFunction if not used
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; // <-- ADD jwt import
import { v4 as uuidv4 } from 'uuid';
import User from '../models/User';
// Make sure JWT_SECRET is in your .env file!
if (!process.env.JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined in environment variables.");
    process.exit(1);
}

// --- User Registration ---
export const registerUser = async (req: Request, res: Response /* REMOVE: next */) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            appUserId: uuidv4(),
            username,
            email,
            password: hashedPassword,
        });

        const savedUser = await newUser.save();

        // --- Generate JWT ---
        const payload = {
             id: savedUser.appUserId, // Or savedUser._id if you prefer
             username: savedUser.username
             // Add other non-sensitive fields if needed in req.user later
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET!, {
            expiresIn: '7d', // Or your desired expiration
        });
        // --- End Generate JWT ---

        // Send token and user info back
        res.status(201).json({
            message: 'User registered successfully.',
            token: token, // <-- Send the token
            user: {
                id: savedUser.appUserId,
                username: savedUser.username,
                email: savedUser.email,
            },
        });

    } catch (error) {
        console.error('Registration Error:', error);
        // REMOVE: next(error); // Don't call next if you're sending a response
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

// --- User Login ---
export const loginUser = async (req: Request, res: Response /* REMOVE: next */) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password.' });
    }

    try {
        const user = await User.findOne({ email }).select('+password');
        if (!user || !user.password) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password as string);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

         // --- Generate JWT ---
         const payload = {
             id: user.appUserId, // Or user._id
             username: user.username
         };
         const token = jwt.sign(payload, process.env.JWT_SECRET!, {
             expiresIn: '7d',
         });
         // --- End Generate JWT ---

         // Send token and user info
         res.status(200).json({
             message: 'Login successful.',
             token: token, // <-- Send the token
             user: {
                 id: user.appUserId,
                 username: user.username,
                 email: user.email,
             },
         });

    } catch (error) {
        console.error('Login Error:', error);
        // REMOVE: next(error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};

// --- Get Auth Status (Protected Route) ---
// This now relies on the 'protect' middleware running first
export const getAuthStatus = (req: Request, res: Response) => {
    // If middleware succeeds, req.user is populated from the token
    if (req.user) {
         // You might fetch fresh user data here if needed, or just return payload info
         // For simplicity, just return info from token:
        res.json({
            isAuthenticated: true,
            user: {
                // @ts-expect-error TS2345 - Suppressing ArrayBufferLike error temporarily
                 id: req.user.id,
                 // @ts-expect-error TS2345 - Suppressing ArrayBufferLike error temporarily
                 username: req.user.username,
                 // NOTE: Email is not in the default token payload we created,
                 // add it during signing or fetch user from DB if needed here.
            }
        });
    } else {
        // This case should ideally be caught by the middleware sending 401
        res.json({ isAuthenticated: false, user: null });
    }
};
