import { db } from "@/database";
import { validateData } from "@/middleware/schemavalidator";
import { Router } from "express";
import { z } from 'zod';

const electionRouter = Router();

electionRouter.get("/", async (req, res, next) => {
    const result = await db
        .selectFrom("election")
        .selectAll()
        .execute()
        .catch(e => next(e))

    res.json(result)
})

export const createNewElectionSchema = z.object({
    name: z.string(),
    draft: z.boolean(),
});

type createNewElectionType = z.infer<typeof createNewElectionSchema>

electionRouter.post('/', validateData(createNewElectionSchema), async (req, res, next) => {
    const data: createNewElectionType = req.body

    const result = await db
        .insertInto('election')
        .values(data)
        .returning(["id", "name"])
        .executeTakeFirst()
        .catch(e => next(e))

    res.status(201).json(result)
});

export default electionRouter
