import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Define the shape of the JWT payload
// Make sure this matches what you sign in authController
interface UserPayload {
  id: string; // Typically the appUserId or MongoDB _id
  username: string;
  // Add other fields you include in the token
}

// Extend the Express Request type to include the user payload
declare global {
  namespace Express {
    interface Request {
        // @ts-expect-error TS2345 - Suppressing ArrayBufferLike error temporarily
      user?: UserPayload;
    }
  }
}

export const protect = (req: Request, res: Response, next: NextFunction) => {
  let token;

  // Check for Authorization header starting with Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header (Bearer <token>)
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;

      // Attach user payload to the request object (excluding password or sensitive data)
      // You might fetch the full user from DB here if needed, but often payload is enough
      req.user = decoded; // Contains id, username etc. from the token

      next(); // Proceed to the next middleware/route handler
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};
