import { Router } from "express";
import { z } from 'zod';
import { validateData, validateRouteParams } from "@/middleware/validators";
import { db } from "@/database";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { authMiddleware } from "@/middleware/auth";

const positionRouter = Router();

export const createNewPositionSchema = z.object({
    name: z.string(),
    description: z.string(),
    seats: z.string(),
    election_id: z.number()
});

type createNewPositionType = z.infer<typeof createNewPositionSchema>

positionRouter.post('/', authMiddleware, validateData(createNewPositionSchema), async (req, res, next) => {
    const data: createNewPositionType = req.body

    db
        .insertInto('position')
        .values(data)
        .returningAll()
        .executeTakeFirst()
        .then(result => res.status(201).json(result))
        .catch(e => next(e))
});

const idRouteParamsSchema = z.object({
    id: z.string(),
})

positionRouter.get('/:id', validateRouteParams(idRouteParamsSchema), async (req, res, next) => {
    const id = parseInt(req.params.id!)

    db
        .selectFrom("position")
        .where("id", "=", id)
        .selectAll()
        .select(eb => jsonArrayFrom(
            eb.selectFrom("application")
                .selectAll()
                .whereRef("application.position_id", "=", "application.id")
        ).as("applications"))
        .execute()
        .then(result => res.status(200).json(result))
        .catch(err => next(err))
})



export default positionRouter
