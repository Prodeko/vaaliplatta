// lib/kysely.ts
import { Pool } from 'pg'
import { Kysely, PostgresDialect } from 'kysely'
// Replace with your generated DB interface
import { DB } from './db'

const dialect = new PostgresDialect({
    pool: new Pool({
        host: process.env.POSTGRES_HOST,
        user: process.env.POSTGRES_USER,
        database: process.env.POSTGRES_DB,
        password: process.env.POSTGRES_PASSWORD,
        port: parseInt(process.env.POSTGRES_PORT || '5432'),
        ssl: process.env.NODE_ENV !== 'development'
    }),
})

export const db = new Kysely<DB>({ dialect })
