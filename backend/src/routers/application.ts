import { Router } from "express";
import { z } from 'zod';
import { validateData, validateRouteParams } from "@/middleware/validators";
import { db } from "@/database";


export const applicationRouter = Router();

export const createNewApplicationSchema = z.object({
    "content": z.string(),
    "applicant_name": z.string(),
    "applicant_id": z.string(),
    "position_id": z.number(),
})

type createNewApplicationType = z.infer<typeof createNewApplicationSchema>

applicationRouter.post('/', validateData(createNewApplicationSchema), async (req, res, next) => {
    const data: createNewApplicationType = req.body

    db
        .insertInto("application")
        .values(data)
        .returningAll()
        .executeTakeFirst()
        .then(result => res.status(201).json(result))
        .catch(e => next(e))
})

const idRouteParamsSchema = z.object({
    id: z.string(),
})

applicationRouter.delete('/:id', validateRouteParams(idRouteParamsSchema), async (req, res, next) => {
    const id = parseInt(req.params.id!)

    try {
        const result = await db
            .deleteFrom('application')
            .where('id', '=', id)
            .execute()

        if (result.numUpdatedRows === 0) {
            return res.status(404).json({ message: 'Application not found' })
        }

        res.status(204).send();
    } catch (error) {
        next(error);
    }
})