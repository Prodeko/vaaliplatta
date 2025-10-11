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

const electionStateEnum = z.enum(['draft', 'open', 'closed', 'archived']);

export const createNewElectionSchema = z.object({
    name: z.string(),
    description: z.string().nullable().optional(),
    state: electionStateEnum.optional(),
});

type createNewElection = z.infer<typeof createNewElectionSchema>

electionRouter.post('/', requireSuperUser, validateData(createNewElectionSchema), async (req, res, next) => {
    const data: createNewElection = req.body
    const insertData = {
        name: data.name,
        description: data.description ?? null,
        state: data.state ?? 'draft',
    }

    db
        .insertInto('election')
        .values(insertData)
        .returningAll()
        .executeTakeFirst()
        .then(result => res.status(201).json(result))
        .catch(e => next(e))
});

const updateElectionSchema = z.object({
    name: z.string().optional(),
    description: z.string().nullable().optional(),
    state: electionStateEnum.optional(),
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
            const updateData = {
                ...(data.name !== undefined ? { name: data.name } : {}),
                ...(data.description !== undefined ? { description: data.description } : {}),
                ...(data.state !== undefined ? { state: data.state } : {}),
            }

            const result = await db
                .updateTable('election')
                .set(updateData)
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
