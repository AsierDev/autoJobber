import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

// Extend the Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

/**
 * Middleware to authenticate requests using JWT
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // For development only - uncomment to inject a mock user for testing
    // Skip JWT validation during development if needed
    if (process.env.NODE_ENV === 'development' && process.env.MOCK_AUTH === 'true') {
      req.user = { id: "mock-user-id", email: "user@example.com" };
      next();
      return;
    }

    // Get the token from the headers
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No authentication token provided' });
      return;
    }

    // Extract the token
    const token = authHeader.split(' ')[1];
    
    // Verify the token
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      console.error('JWT secret is not configured');
      res.status(500).json({ error: 'Authentication service misconfigured' });
      return;
    }
    
    // Verify token
    const decoded = jwt.verify(token, jwtSecret) as { id: string, email: string };
    
    // Get user from database
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      res.status(401).json({ error: 'Invalid authentication token' });
      return;
    }
    
    // Set user on request
    req.user = { id: user.id, email: user.email };
    
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: "Invalid token" });
    } else {
      res.status(401).json({ error: "Authentication failed" });
    }
  }
};
