// logger.ts
import { config, LOG_LEVEL } from '../config';
import { Request, Response, NextFunction } from 'express';

const logger = (req: Request, res: Response, next: NextFunction): void => {
    const method = req.method;
    const url = req.url;
    const timestamp = new Date().toISOString();

    if (config.LOG_LEVEL == LOG_LEVEL.VERBOSE || config.LOG_LEVEL == LOG_LEVEL.INFO)
        console.log(`[${timestamp}] ${method} request to ${url}`);
    if (config.LOG_LEVEL == LOG_LEVEL.VERBOSE) console.log(req.body)

    // Call next to pass control to the next middleware function
    next();
};

export default logger;
