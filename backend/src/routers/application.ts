import { Router } from "express";
import { z } from 'zod';
import { validateData, validateRouteParams } from "../middleware/validators";
import { db } from "../database";
import { AuthenticatedRequest, requireAuthenticated } from "../middleware/auth";
import { Insertable, sql } from "kysely";
import { Application } from "db";

export const applicationRouter = Router();

export const createNewApplicationSchema = z.object({
    "content": z.string(),
    "applicant_name": z.string(),
    "position_id": z.string(),
    "profile_picture": z.string().nullable().optional(),
})

type createNewApplicationType = z.infer<typeof createNewApplicationSchema>

applicationRouter.post(
    '/',
    requireAuthenticated,
    validateData(createNewApplicationSchema),
    async (req: AuthenticatedRequest, res, next) => {
        const body: createNewApplicationType = req.body
        const applicant_id = req.session?.pk

        if (!applicant_id) return res.status(400).send("Applicant id missing from auth session")

        const data = { ...body, "position_id": parseInt(body.position_id), applicant_id: applicant_id.toString() }

        try {
            const application = await createOrUpdateApplication(data)
            return res.status(201).json(application)
        } catch (error) {
            next(error);
        }
    })

export async function createOrUpdateApplication(data: Insertable<Application>) {

    const position = await db
        .selectFrom("position")
        .selectAll()
        .where("id", "=", data.position_id)
        .executeTakeFirst();

    if (!position || position.state !== "open") throw Error("Cannot create or edit applications to a position whose state is not open!")

    // Check if an application already exists with the same position_id and applicant_id
    const existingApplication = await db
        .selectFrom("application")
        .selectAll()
        .where("position_id", "=", data.position_id)
        .where("applicant_id", "=", data.applicant_id)
        .executeTakeFirst();

    if (existingApplication) {
        // If an application exists, update it
        const updatedApplication = await db
            .updateTable("application")
            .set(data) // Update with new data
            .where("id", "=", existingApplication.id) // Assuming the existing application has an 'id' field
            .returningAll()
            .executeTakeFirst();

        return updatedApplication
    } else {
        // If no application exists, insert a new one
        const newApplication = await db
            .insertInto("application")
            .values(data)
            .returningAll()
            .executeTakeFirst();

        return newApplication
    }
}

const idRouteParamsSchema = z.object({
    id: z.string(),
})

applicationRouter.post(
    '/:id/read',
    requireAuthenticated,
    validateRouteParams(idRouteParamsSchema),
    async (req: AuthenticatedRequest, res, next) => {
        try {
            const application_id = parseInt(req.params.id!)
            const user_id = req.session?.pk.toString()!

            await db.insertInto('read_receipts')
                .values({ user_id, application_id })
                .onConflict(oc =>
                    oc.columns(['application_id', 'user_id'])
                        .doUpdateSet({ time: sql`CURRENT_TIMESTAMP` })
                )
                .executeTakeFirst()

            const created = await db.selectFrom('read_receipts_with_election_id')
                .where('user_id', '=', user_id)
                .where('application_id', '=', application_id)
                .selectAll()
                .executeTakeFirst()

            return res.status(201).json(created)

        } catch (error) {
            next(error)
        }
    }
)

applicationRouter.delete(
    '/:id',
    requireAuthenticated,
    validateRouteParams(idRouteParamsSchema),
    async (req, res, next) => {

        const id = parseInt(req.params.id!)
        try {
            const result = await db
                .deleteFrom('application')
                .where('id', '=', id)
                .execute()
            // @ts-ignore
            if (result.numUpdatedRows === 0) {
                return res.status(404).json({ message: 'Application not found' })
            }
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    })