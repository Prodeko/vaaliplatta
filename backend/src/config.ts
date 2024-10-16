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
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_EXPIRATION: process.env.JWT_EXPIRATION!,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    OAUTH_CLIENT_ID: process.env.OAUTH_CLIENT_ID!,
    OAUTH_CLIENT_SECRET: process.env.OAUTH_CLIENT_SECRET!,
    OAUTH_AUTHORIZATION_URL: process.env.OAUTH_AUTHORIZATION_URL!,
    OAUTH_CALLBACK_URI: process.env.OAUTH_CALLBACK_URI!,
    OAUTH_TOKEN_URL: process.env.OAUTH_TOKEN_URL!,
    OAUTH_PROFILE_URL: process.env.OAUTH_PROFILE_URL!,
    SESSION_SECRET: process.env.SESSION_SECRET!,
    OAUTH_TOKEN_HOST: process.env.OAUTH_TOKEN_HOST!,
    OAUTH_TOKEN_PATH: process.env.OAUTH_TOKEN_PATH!,
    OAUTH_AUTHORIZE_HOST: process.env.OAUTH_AUTHORIZE_HOST!,
    OAUTH_AUTHORIZE_PATH: process.env.OAUTH_AUTHORIZE_PATH!,
    FRONTEND_URL: process.env.FRONTEND_URL!,
}