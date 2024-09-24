import { Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config'
import { z } from 'zod'
import { validateData } from "@/middleware/validators"

export const authRouter = Router();

export const loginSchema = z.object({
    "password": z.string()
})

authRouter.post('/login', validateData(loginSchema), async (req, res, next) => {
    const { password } = req.body;

    const JWT_SECRET = config.JWT_SECRET as string
    const JWT_EXPIRATION = config.JWT_EXPIRATION as string
    const ADMIN_PASSWORD = config.ADMIN_PASSWORD as string

    try {
        if (password === ADMIN_PASSWORD) {
            // Generate JWT token
            const token = jwt.sign(
                { user: 'admin' },  // Payload (can be more user info like ID)
                JWT_SECRET,
                { expiresIn: JWT_EXPIRATION }   // Set token expiration
            );

            // Send the token in the response
            res.json({ message: 'Login successful', token });
        } else {
            res.status(401).json({ message: 'Incorrect password' });
        }
    } catch (e) {
        next(e)
    }
})
