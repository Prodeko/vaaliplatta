import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config'
import { UserDetailsResponse } from '../routers/auth';

export interface AuthenticatedRequest extends Request {
    session?: DecodedToken;
}

export interface DecodedToken {
    iat: number,
    exp: number,
    pk: string,
    email: string,
    first_name: string,
    last_name: string,
    is_superuser: boolean,
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.cookies?.vaaliplatta_auth_token;

    if (!token) {
        return next();
    }

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
    const is_superuser = (!!decodedToken?.email) && config.VAALIPLATTA_SUPERUSERS.includes(decodedToken.email)
    if (!is_superuser) return res.status(403).json({ message: 'Insufficient privileges' });

    return next()
}

export const requireAuthenticated = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const decodedToken = req.session

    if (!decodedToken) return res.status(401).json({ message: 'No token provided' });

    return next();
}