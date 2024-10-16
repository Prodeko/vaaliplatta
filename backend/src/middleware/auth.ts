import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config'
import { UserDetailsResponse } from '@/routers/auth';

export interface AuthenticatedRequest extends Request {
    session?: DecodedToken;
}

export interface DecodedToken extends UserDetailsResponse {
    token: string,
    iat: number,
    exp: number,
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }

    const token = authHeader.split(' ')[1] ?? "";

    try {
        // Verify the token
        const decoded = jwt.verify(token, config.JWT_SECRET) as DecodedToken
        req.session = decoded
        return next();
    } catch (error) {
        console.log(error)
        return next();
    }
};

export const requireSuperUser = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.session

    if (!decodedToken) return res.status(401).json({ message: 'No token provided' });
    if (!decodedToken.is_superuser) return res.status(403).json({ message: 'Insufficient privileges' });

    return next()
}

export const requireAuthenticated = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.session

    if (!decodedToken) return res.status(401).json({ message: 'No token provided' });

    return next();
}