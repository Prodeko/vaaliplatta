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

        db
            .insertInto("application")
            .values(data)
            .returningAll()
            .executeTakeFirst()
            .then(result => res.status(201).json(result))
            .catch(e => next(e))
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