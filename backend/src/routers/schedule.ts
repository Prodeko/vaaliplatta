import { Router } from "express";
import { z } from 'zod';
import { sql, Transaction } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { validateData, validateQueryParams, validateRouteParams } from "../middleware/validators";
import { db } from "../database";
import { DB } from "../db";

// Schedules control when applications to positions are open. The effective
// state of a position is derived in the position_effective view: saving a
// schedule and each window opening or closing count as state changes, and the
// latest change (scheduled or manual) wins. These routes only store the windows.

const scheduleRouter = Router();

const scheduleBodySchema = z.object({
    name: z.string().min(1),
    opens_at: z.string().datetime({ offset: true }),
    closes_at: z.string().datetime({ offset: true }),
    position_ids: z.array(z.number()).min(1),
});

const createScheduleSchema = scheduleBodySchema.extend({
    election_id: z.number(),
});

type ScheduleBody = z.infer<typeof scheduleBodySchema>
type CreateScheduleBody = z.infer<typeof createScheduleSchema>

const idRouteParamsSchema = z.object({
    id: z.string(),
})

const listQueryParamsSchema = z.object({
    election_id: z.string(),
})

class BadRequestError extends Error {
    status = 400
}

function assertValidWindow(body: ScheduleBody) {
    if (new Date(body.closes_at) <= new Date(body.opens_at)) {
        throw new BadRequestError("closes_at must be after opens_at")
    }
}

// Saving a schedule writes its positions and sets their stored state to
// closed, so that removing every schedule later never leaves a position open
// by accident. state_changed_at is left alone because saving the schedule is
// itself the latest change. Draft and archived positions keep their state.
async function setSchedulePositions(trx: Transaction<DB>, scheduleId: number, electionId: number, positionIds: number[]) {
    const positions = await trx
        .selectFrom("position")
        .select("id")
        .where("id", "in", positionIds)
        .where("election_id", "=", electionId)
        .execute()

    if (positions.length !== new Set(positionIds).size) {
        throw new BadRequestError("All positions must belong to the schedule's election")
    }

    await trx.deleteFrom("schedule_position").where("schedule_id", "=", scheduleId).execute()

    await trx
        .insertInto("schedule_position")
        .values(positions.map(p => ({ schedule_id: scheduleId, position_id: p.id })))
        .execute()

    await trx
        .updateTable("position")
        .set({ state: "closed" })
        .where("id", "in", positionIds)
        .where("state", "=", "open")
        .execute()
}

scheduleRouter.get('/', validateQueryParams(listQueryParamsSchema), async (req, res, next) => {
    try {
        const electionId = parseInt(req.query.election_id as string)

        const schedules = await db
            .selectFrom("schedule")
            .selectAll()
            .select(eb => jsonArrayFrom(
                eb.selectFrom("schedule_position")
                    .select("position_id")
                    .whereRef("schedule_position.schedule_id", "=", "schedule.id")
            ).as("positions"))
            .where("election_id", "=", electionId)
            .orderBy("opens_at")
            .execute()

        res.status(200).json(schedules.map(({ positions, ...schedule }) => ({
            ...schedule,
            position_ids: positions.map(p => p.position_id),
        })))
    } catch (error) {
        next(error)
    }
})

scheduleRouter.post('/', validateData(createScheduleSchema), async (req, res, next) => {
    try {
        const body: CreateScheduleBody = req.body
        assertValidWindow(body)

        const schedule = await db.transaction().execute(async trx => {
            const created = await trx
                .insertInto("schedule")
                .values({
                    election_id: body.election_id,
                    name: body.name,
                    opens_at: body.opens_at,
                    closes_at: body.closes_at,
                })
                .returningAll()
                .executeTakeFirstOrThrow()

            await setSchedulePositions(trx, created.id, created.election_id, body.position_ids)
            return created
        })

        res.status(201).json({ ...schedule, position_ids: body.position_ids })
    } catch (error) {
        next(error)
    }
})

scheduleRouter.put(
    '/:id',
    validateRouteParams(idRouteParamsSchema),
    validateData(scheduleBodySchema),
    async (req, res, next) => {
        try {
            const id = parseInt(req.params.id!)
            const body: ScheduleBody = req.body
            assertValidWindow(body)

            const schedule = await db.transaction().execute(async trx => {
                const updated = await trx
                    .updateTable("schedule")
                    .set({
                        name: body.name,
                        opens_at: body.opens_at,
                        closes_at: body.closes_at,
                        updated_at: sql`now()`,
                    })
                    .where("id", "=", id)
                    .returningAll()
                    .executeTakeFirst()

                if (!updated) return undefined

                await setSchedulePositions(trx, updated.id, updated.election_id, body.position_ids)
                return updated
            })

            if (!schedule) return res.status(404).json({ message: 'Schedule not found' })

            res.status(200).json({ ...schedule, position_ids: body.position_ids })
        } catch (error) {
            next(error)
        }
    }
)

scheduleRouter.delete('/:id', validateRouteParams(idRouteParamsSchema), async (req, res, next) => {
    try {
        const id = parseInt(req.params.id!)

        const result = await db
            .deleteFrom("schedule")
            .where("id", "=", id)
            .executeTakeFirst()

        if (Number(result.numDeletedRows) === 0) return res.status(404).json({ message: 'Schedule not found' })

        res.status(204).send()
    } catch (error) {
        next(error)
    }
})

export default scheduleRouter
