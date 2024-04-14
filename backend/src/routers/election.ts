import { db } from "@/database";
import { validateData } from "@/middleware/schemavalidator";
import { Router } from "express";
import { z } from 'zod';

const electionRouter = Router();

electionRouter.get("/", async (req, res, next) => {
    db
        .selectFrom("election")
        .selectAll()
        .execute()
        .then(result => res.status(200).json(result))
        .catch(e => next(e))
})

export const createNewElectionSchema = z.object({
    name: z.string(),
    draft: z.boolean(),
});

type createNewElectionType = z.infer<typeof createNewElectionSchema>

electionRouter.post('/', validateData(createNewElectionSchema), async (req, res, next) => {
    const data: createNewElectionType = req.body

    db
        .insertInto('election')
        .values(data)
        .returning(["id", "name"])
        .executeTakeFirst()
        .then(result => res.status(201).json(result))
        .catch(e => next(e))
});

export default electionRouter
