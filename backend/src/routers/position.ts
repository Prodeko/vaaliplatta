import { Router } from "express";
import { z } from 'zod';
import { validateData } from "@/middleware/validators";
import { db } from "@/database";


const positionRouter = Router();

export const createNewPositionSchema = z.object({
    name: z.string(),
    description: z.string(),
    seats: z.number(),
    "election.id": z.number()
});

type createNewPositionType = z.infer<typeof createNewPositionSchema>

positionRouter.post('/', validateData(createNewPositionSchema), async (req, res, next) => {
    const data: createNewPositionType = req.body

    db
        .insertInto('position')
        .values(data)
        .returningAll()
        .executeTakeFirst()
        .then(result => res.status(201).json(result))
        .catch(e => next(e))
});



export default positionRouter
