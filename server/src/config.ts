import dotenv from 'dotenv'

dotenv.config()

export const config = {
    DATABASE_CONNECTION_STRING: process.env.DATABASE_CONNECTION_STRING
}