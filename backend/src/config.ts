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
    KEYCLOAK_URL: process.env.KEYCLOAK_URL!,
    KEYCLOAK_REALM: process.env.KEYCLOAK_REALM!,
    KEYCLOAK_CLIENT_ID: process.env.KEYCLOAK_CLIENT_ID!,
    KEYCLOAK_CLIENT_SECRET: process.env.KEYCLOAK_CLIENT_SECRET!,
    KEYCLOAK_ADMIN_CLIENT_ID: process.env.KEYCLOAK_ADMIN_CLIENT_ID!,
    KEYCLOAK_ADMIN_CLIENT_SECRET: process.env.KEYCLOAK_ADMIN_CLIENT_SECRET!,
    KEYCLOAK_SUPERUSER_ROLE: process.env.KEYCLOAK_SUPERUSER_ROLE!,
    KEYCLOAK_CALLBACK_URI: process.env.KEYCLOAK_CALLBACK_URI!,
    FRONTEND_URL: process.env.FRONTEND_URL!,
    FRONTEND_DIST_FOLDER: process.env.FRONTEND_DIST_FOLDER!,
    AZ_BLOB_CONNECTION_STRING: process.env.AZ_BLOB_CONNECTION_STRING!,
    USE_MOCK_AUTHENTICATION: process.env.USE_MOCK_AUTHENTICATION !== undefined
        ? process.env.USE_MOCK_AUTHENTICATION === "true"
        : process.env.ENV === "DEV",
    AUTH_COOKIE_MAX_AGE_MILLISECONDS: parseInt(process.env.AUTH_COOKIE_MAX_AGE_MILLISECONDS!),
}

console.log(config)
