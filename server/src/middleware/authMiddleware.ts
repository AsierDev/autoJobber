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
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // For development only - inject a mock user for testing
    // In a real application, you would validate JWT tokens here
    req.user = { id: "mock-user-id", email: "user@example.com" };
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ error: "Authentication failed" });
  }
};
