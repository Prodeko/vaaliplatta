import type { Request, Response, Application } from 'express'
import express from 'express'
import * as path from 'path'
import { Pool } from 'pg'
import { promises as fs } from 'fs'
import {
  Kysely,
  Migrator,
  PostgresDialect,
  FileMigrationProvider,
} from 'kysely'
import { DB } from 'kysely-codegen'
import { config } from './src/config'
import electionRouter from '@/routers/election'
import bodyParser from 'body-parser'
import errorHandler from '@/middleware/errorHandler'
import positionRouter from '@/routers/position'
import logger from '@/middleware/logger'
import { applicationRouter } from '@/routers/application'
import { authRouter } from '@/routers/auth'
import cors from 'cors'
import { uploadRouter } from '@/routers/upload'
import cookieParser from 'cookie-parser'
import { authMiddleware } from '@/middleware/auth'


async function migrateToLatest() {
  const db = new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: new Pool({
        connectionString: config.DATABASE_URL
      }),
    }),
  })

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      // This needs to be an absolute path.
      migrationFolder: path.join(__dirname, 'src/migrations'),
    }),
  })

  if (config.ENV === 'DEV') await migrator.migrateDown() // ! DO NOT PUT IN PRODUCTION

  const { error, results } = await migrator.migrateToLatest()

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`migration "${it.migrationName}" was executed successfully`)
    } else if (it.status === 'Error') {
      console.error(`failed to execute migration "${it.migrationName}"`)
    }
  })

  if (error) {
    console.error('failed to migrate')
    console.error(error)
    process.exit(1)
  }

  await db.destroy()
}


migrateToLatest()
const app: Application = express()
const port = process.env.PORT ?? 8000
const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // Enable cookies and authorization headers
}

app.use(cors(corsOptions))
app.use(cookieParser())
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }));
app.use(logger)

app.use(authMiddleware)

app.use("/api/election/", electionRouter)
app.use("/api/position/", positionRouter)
app.use("/api/application", applicationRouter)
app.use("/api/upload", uploadRouter)
app.use("/", authRouter)

app.use("/test", (req, res, next) => res.status(200).send("It works"))

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Now listening on http://localhost:${port}`)
})
