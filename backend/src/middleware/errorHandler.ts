import { config } from '../config'
import { Request, Response, NextFunction } from 'express';

function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    if (config.ENV === "DEV") console.log(err)

    const statusCode: number = err.status ?? 500;

    res.status(statusCode).json({ error: err.message });
}

export default errorHandler;