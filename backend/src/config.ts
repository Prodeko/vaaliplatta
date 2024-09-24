import dotenv from 'dotenv'

dotenv.config()

export enum LOG_LEVEL {
    VERBOSE,
    INFO,
}

let log_level = LOG_LEVEL.INFO

switch (process.env.LOG_LEVEL) {
    case "VERBOSE":
    case "verbose":
        log_level = LOG_LEVEL.VERBOSE;
        break;
    case "INFO":
    case "info":
        log_level = LOG_LEVEL.INFO;
        break;
    default:
        log_level = LOG_LEVEL.INFO;
        break;
}


export const config = {
    DATABASE_URL: process.env.DATABASE_URL,
    ENV: process.env.ENV,
    LOG_LEVEL: log_level,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRATION: process.env.JWT_EXPIRATION,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD
}