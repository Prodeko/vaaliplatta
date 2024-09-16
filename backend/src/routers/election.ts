import { db } from "@/database";
import { validateData, validateRouteParams } from "@/middleware/validators";
import { Router } from "express";
import { z } from 'zod';
import { jsonArrayFrom } from 'kysely/helpers/postgres'

const electionRouter = Router();

electionRouter.get("/", async (req, res, next) => {
    try {
        const election = await db
            .selectFrom("election")
            .selectAll()
            .execute()

        res.status(200).json(election)
    } catch (err) {
        next(err)
    }
})

const idRouteParamsSchema = z.object({
    id: z.string(),
});

electionRouter.get("/:id", validateRouteParams(idRouteParamsSchema), async (req, res, next) => {
    try {
        const id = parseInt(req.params.id!)

        const election = await db
            .selectFrom("election")
            .where("id", "=", id)
            .selectAll()
            .select(eb => jsonArrayFrom(
                eb.selectFrom("position")
                    .selectAll()
                    .whereRef("election.id", "=", "id")
            ).as("positions"))
            .execute()

        res.status(200).json(election)
    } catch (err) {
        next(err)
    }
})

export const createNewElectionSchema = z.object({
    name: z.string(),
    draft: z.boolean(),
});

type createNewElection = z.infer<typeof createNewElectionSchema>

electionRouter.post('/', validateData(createNewElectionSchema), async (req, res, next) => {
    const data: createNewElection = req.body

    db
        .insertInto('election')
        .values(data)
        .returningAll()
        .executeTakeFirst()
        .then(result => res.status(201).json(result))
        .catch(e => next(e))
});

export default electionRouter
