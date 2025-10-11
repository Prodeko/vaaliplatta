import { db } from "../database";
import { validateData, validateRouteParams } from "../middleware/validators";
import { Router } from "express";
import { z } from 'zod';
import { jsonArrayFrom } from 'kysely/helpers/postgres'
import { AuthenticatedRequest, requireSuperUser } from "../middleware/auth";

const electionRouter = Router();

electionRouter.get("/", async (req: AuthenticatedRequest, res, next) => {
    try {
        const isAdmin = req.session?.is_superuser === true;

        const election = isAdmin ?
            await db
                .selectFrom("election")
                .selectAll()
                .execute()
            :
            await db
                .selectFrom("election")
                .where('state', '=', 'open')
                .selectAll()
                .execute()

        res.status(200).json(election);
    } catch (err) {
        next(err);
    }
})

const idRouteParamsSchema = z.object({
    id: z.string(),
});

electionRouter.get("/:id", validateRouteParams(idRouteParamsSchema), async (req: AuthenticatedRequest, res, next) => {
    try {
        const id = req.params.id!
        const user = req.session?.pk
        const isAdmin = req.session?.is_superuser === true;

        let electionQuery;
        if (id === "newest") {
            electionQuery = isAdmin
                ? db
                    .selectFrom("election")
                    .orderBy("id", "desc")
                    .limit(1)
                : db
                    .selectFrom("election")
                    .where("state", "=", "open")
                    .orderBy("id", "desc")
                    .limit(1)
        } else if (!isNaN(parseInt(id))) {
            electionQuery = isAdmin
                ? db
                    .selectFrom("election")
                    .where("id", "=", parseInt(id))
                : db.selectFrom("election")
                    .where("id", "=", parseInt(id))
                    .where("state", "=", "open")
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
    cloneFromElectionId: z.number().optional(),
});

type CreateNewElectionPayload = z.infer<typeof createNewElectionSchema>

electionRouter.post('/', requireSuperUser, validateData(createNewElectionSchema), async (req, res, next) => {
    try {
        const data: CreateNewElectionPayload = req.body;
        const insertData = {
            name: data.name,
            description: data.description ?? null,
            state: data.state ?? 'draft',
        };

        const createdElection = await db
            .insertInto('election')
            .values(insertData)
            .returningAll()
            .executeTakeFirst();

        if (!createdElection) {
            return res.status(500).json({ message: 'Failed to create election' });
        }

        if (data.cloneFromElectionId) {
            const positionsToClone = await db
                .selectFrom('position')
                .select(['name', 'description', 'seats', 'category', 'state'])
                .where('election_id', '=', data.cloneFromElectionId)
                .execute();

            if (positionsToClone.length > 0) {
                const clonedPositions = positionsToClone.map(position => ({
                    name: position.name,
                    description: position.description,
                    seats: position.seats,
                    category: position.category,
                    state: position.state,
                    election_id: createdElection.id,
                }));

                await db
                    .insertInto('position')
                    .values(clonedPositions)
                    .execute();
            }
        }

        res.status(201).json(createdElection);
    } catch (error) {
        next(error);
    }
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
