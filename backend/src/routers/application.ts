import { Router } from "express";
import { z } from 'zod';
import { validateData } from "@/middleware/validators";
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