import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config'

interface AuthenticatedRequest extends Request {
    user?: string | jwt.JwtPayload;
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1] ?? "";  // Extract token from 'Bearer <token>'

    try {
        // Verify the token
        const decoded = jwt.verify(token, config.JWT_SECRET as string);
        req.user = decoded;  // Attach the decoded payload (e.g., user info) to the request object
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};
