import { Router } from "express";
import { AuthenticatedRequest, requireSuperUser } from "../middleware/auth";
import { config } from "../config";
import { Pool } from "pg";
import { validateQueryParams } from "middleware/validators";
import { z } from "zod";

export const userInspectRouter = Router();

// console.log("Connecting to PostgreSQL with the following config:");
// console.log(`User: ${config.POSTGRES_READONLY_USER_FOR_USERDB}`);
// console.log(`Password: ${config.POSTGRES_PASSWORD_FOR_READONLY_USER_FOR_USERDB}`);
// console.log(`Database: ${config.POSTGRES_USERDB}`);
// console.log(`Host: ${config.POSTGRES_HOST}`);
// console.log(`Port: ${config.POSTGRES_PORT}`);

let pool: Pool | null
let poolError: unknown = null
try {
    pool = new Pool({
        user: config.POSTGRES_READONLY_USER_FOR_USERDB,
        password: config.POSTGRES_PASSWORD_FOR_READONLY_USER_FOR_USERDB,
        database: config.POSTGRES_USERDB,
        host: config.POSTGRES_USERDB_HOST,
        port: config.POSTGRES_PORT,
        ssl: true,
    })
} catch (error) {
    pool = null
    poolError = error
}

const searchQueryParamsSchema = z.object({
    q: z.string().min(3)
});

userInspectRouter.get(
    '/search',
    requireSuperUser,
    validateQueryParams(searchQueryParamsSchema),
    async (req: AuthenticatedRequest, res, next) => {
        if (!pool) return res.status(500).json({ "message": "User inspect db pool connection failed", "error": poolError })

        try {
            const searchTerm = (req.query.q! as string).toLowerCase()
            const result = await pool.query(`
                select id, first_name, last_name, email
                from ${config.POSTGRES_USERTABLE}
                where lower(last_name) like '${searchTerm}%'
                or lower(first_name) like '${searchTerm}%'
                or lower(email) like '${searchTerm}%'
                order by id desc
                limit 25`
            )

            return res.status(200).json(result)
        } catch (error) {
            return res.status(404).send(error)
        }
    })

