import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

// Extend the Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Middleware to authenticate requests using JWT
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ error: 'No authentication token provided' });
      return;
    }

    // Para desarrollo, aceptar un token simulado
    if (authHeader === 'Bearer mock-token-for-development' && process.env.NODE_ENV !== 'production') {
      // Configurar un usuario de prueba para desarrollo
      req.user = {
        id: '00000000-0000-0000-0000-000000000000',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user'
      };
      next();
      return;
    }

    // Validación normal de JWT para producción
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      res.status(401).json({ error: 'Invalid authentication token format' });
      return;
    }

    // Verificar el token
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key_for_dev');
    
    // Buscar el usuario en la base de datos
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }
    
    // Añadir el usuario a la request
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }
    
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

// Middleware para verificar roles
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Unauthorized: Insufficient permissions' });
      return;
    }

    next();
  };
};
