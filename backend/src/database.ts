import { DB } from 'db' // this is the Database interface we defined earlier
import { Pool } from 'pg'
import { Kysely, PostgresDialect } from 'kysely'
import { config } from './config'

const dialect = new PostgresDialect({
    pool: new Pool({
        host: config.POSTGRES_HOST,
        password: config.POSTGRES_PASSWORD,
        database: config.POSTGRES_DB,
        port: config.POSTGRES_PORT,
        user: config.POSTGRES_USER,
        ssl: config.ENV !== "DEV"
    })
})

// Database interface is passed to Kysely's constructor, and from now on, Kysely 
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how 
// to communicate with your database.
export const db = new Kysely<DB>({
    dialect,
})