import { Router } from "express";
import { z } from 'zod';
import { validateData, validateRouteParams } from "@/middleware/validators";
import { db } from "@/database";
import { AuthenticatedRequest, requireAuthenticated } from "@/middleware/auth";

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

                return res.status(200).json(updatedApplication);
            } else {
                // If no application exists, insert a new one
                const newApplication = await db
                    .insertInto("application")
                    .values(data)
                    .returningAll()
                    .executeTakeFirst();

                return res.status(201).json(newApplication);
            }
        } catch (error) {
            next(error);
        }
    })

const idRouteParamsSchema = z.object({
    id: z.string(),
})

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