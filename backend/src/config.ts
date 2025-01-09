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
    PORT: process.env.PORT ? parseInt(process.env.PORT) : 8000,
    POSTGRES_HOST: process.env.POSTGRES_HOST!,
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD!,
    POSTGRES_DB: process.env.POSTGRES_DB!,
    POSTGRES_PORT: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT) : 5432,
    POSTGRES_USER: process.env.POSTGRES_USER!,
    ENV: process.env.ENV,
    LOG_LEVEL: log_level,
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_EXPIRATION: process.env.JWT_EXPIRATION!,
    OAUTH_CLIENT_ID: process.env.OAUTH_CLIENT_ID!,
    OAUTH_CLIENT_SECRET: process.env.OAUTH_CLIENT_SECRET!,
    OAUTH_CALLBACK_URI: process.env.OAUTH_CALLBACK_URI!,
    OAUTH_HOST: process.env.OAUTH_HOST!,
    OAUTH_TOKEN_PATH: process.env.OAUTH_TOKEN_PATH!,
    OAUTH_AUTHORIZE_PATH: process.env.OAUTH_AUTHORIZE_PATH!,
    OAUTH_PROFILE_PATH: process.env.OAUTH_PROFILE_PATH!,
    FRONTEND_URL: process.env.FRONTEND_URL!,
    FRONTEND_DIST_FOLDER: process.env.FRONTEND_DIST_FOLDER!,
    AZ_BLOB_CONNECTION_STRING: process.env.AZ_BLOB_CONNECTION_STRING!,
    POSTGRES_READONLY_USER_FOR_USERDB: process.env.POSTGRES_READONLY_USER_FOR_USERDB!,
    POSTGRES_PASSWORD_FOR_READONLY_USER_FOR_USERDB: process.env.POSTGRES_PASSWORD_FOR_READONLY_USER_FOR_USERDB!,
    POSTGRES_USERDB: process.env.POSTGRES_USERDB!,
    POSTGRES_USERTABLE: process.env.POSTGRES_USERTABLE!,
    POSTGRES_USERDB_HOST: process.env.POSTGRES_USERDB_HOST!,
    VAALIPLATTA_SUPERUSERS: process.env.VAALIPLATTA_SUPERUSERS?.split(",") || ["cto@prodeko.org"],
}

console.log(config)