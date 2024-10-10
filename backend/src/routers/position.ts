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
                .whereRef("application.position_id", "=", "position.id")
        ).as("applications"))
        .executeTakeFirst()
        .then(result => res.status(200).json(result))
        .catch(err => next(err))
})

positionRouter.delete('/:id', validateRouteParams(idRouteParamsSchema), async (req, res, next) => {
    const id = parseInt(req.params.id!);

    try {
        const result = await db
            .deleteFrom('position')
            .where('id', '=', id)
            .execute();

        if (result.numUpdatedRows === 0) {
            return res.status(404).json({ message: 'Position not found' });
        }

        res.status(204).send(); // No content
    } catch (error) {
        next(error);
    }
});


export default positionRouter
