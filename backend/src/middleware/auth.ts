import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config'
import { UserDetailsResponse } from '@/routers/auth';

interface AuthenticatedRequest extends Request {
    session?: DecodedToken;
}

interface DecodedToken extends UserDetailsResponse {
    token: string,
    iat: number,
    exp: number,
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1] ?? "";

    try {
        // Verify the token
        const decoded = jwt.verify(token, config.JWT_SECRET) as DecodedToken
        req.session = decoded
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};