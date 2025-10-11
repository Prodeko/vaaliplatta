import { db } from "../database";
import { validateData, validateRouteParams } from "../middleware/validators";
import { Router } from "express";
import { z } from 'zod';
import { jsonArrayFrom } from 'kysely/helpers/postgres'
import { AuthenticatedRequest, requireSuperUser } from "../middleware/auth";

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

electionRouter.get("/:id", validateRouteParams(idRouteParamsSchema), async (req: AuthenticatedRequest, res, next) => {
    try {
        const id = req.params.id!
        const user = req.session?.pk

        let electionQuery;
        if (id === "newest") {
            electionQuery = db
                .selectFrom("election")
                .orderBy("id", "desc")
                .limit(1)
        } else if (!isNaN(parseInt(id))) {
            electionQuery = db
                .selectFrom("election")
                .where("id", "=", parseInt(id))
        } else {
            return res.status(404).json("Invalid ID!")
        }

        const result = await electionQuery.selectAll()
            .select(eb => jsonArrayFrom(
                eb.selectFrom("position")
                    .selectAll()
                    .select(eb => jsonArrayFrom(
                        user
                            ? eb.selectFrom("application")
                                .leftJoin("read_receipts", join => join
                                    .onRef("application.id", "=", "read_receipts.application_id")
                                    .on("read_receipts.user_id", "=", user.toString())
                                )
                                .selectAll()
                                .whereRef("application.position_id", "=", "position.id")
                            : eb.selectFrom("application").selectAll()
                                .whereRef("application.position_id", "=", "position.id")
                    ).as("applications"))
                    .whereRef("position.election_id", "=", "election.id")
            ).as("positions"))
            .executeTakeFirst()

        res.status(200).json(result)

    } catch (err) {
        next(err)
    }
})

export const createNewElectionSchema = z.object({
    name: z.string(),
    draft: z.boolean(),
    description: z.string(),
});

type createNewElection = z.infer<typeof createNewElectionSchema>

electionRouter.post('/', requireSuperUser, validateData(createNewElectionSchema), async (req, res, next) => {
    const data: createNewElection = req.body

    db
        .insertInto('election')
        .values(data)
        .returningAll()
        .executeTakeFirst()
        .then(result => res.status(201).json(result))
        .catch(e => next(e))
});

const updateElectionSchema = z.object({
    name: z.string().optional(),
    draft: z.boolean().optional(),
    description: z.string().optional(),
});

electionRouter.put(
    '/:id',
    requireSuperUser,
    validateRouteParams(idRouteParamsSchema),
    validateData(updateElectionSchema),
    async (req, res, next) => {
        try {
            const id = parseInt(req.params.id!);
            const data = req.body as z.infer<typeof updateElectionSchema>;

            const result = await db
                .updateTable('election')
                .set(data)
                .where('id', '=', id)
                .returningAll()
                .executeTakeFirst();

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
);

export default electionRouter
