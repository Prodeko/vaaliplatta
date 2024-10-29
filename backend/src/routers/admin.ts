import { Router } from "express";
import { validateData, validateQueryParams, validateRouteParams } from "middleware/validators";
import { z } from "zod";
import { createOrUpdateApplication } from "./application";
import { db } from "database";

export const adminRouter = Router();

const createNewApplicationSchema = z.object({
    "content": z.string(),
    "applicant_name": z.string(),
    "position_id": z.string(),
    "profile_picture": z.string().nullable().optional(),
    "applicant_id": z.string(),
})

type createNewApplicationType = z.infer<typeof createNewApplicationSchema>

adminRouter.post(
    '/application',
    validateData(createNewApplicationSchema),
    async (req, res, next) => {
        const body: createNewApplicationType = req.body

        const data = { ...body, "position_id": parseInt(body.position_id) }

        try {
            const application = await createOrUpdateApplication(data)
            return res.status(201).json(application)
        } catch (error) {
            next(error);
        }
    })

const deleteApplicantQueryParamsSchema = z.object({
    position_id: z.string(),
    applicant_id: z.string(),
});

adminRouter.delete(
    '/application',
    validateQueryParams(deleteApplicantQueryParamsSchema),
    async (req, res, next) => {
        try {
            const position_id = parseInt(req.query.position_id! as string)
            const applicant_id = (req.query.applicant_id! as string).toLowerCase()

            await db
                .deleteFrom("application")
                .where("applicant_id", "=", applicant_id)
                .where("position_id", "=", position_id)
                .execute()

            return res.status(204).send()
        } catch (error) {
            return res.status(404).json(error)
        }
    }
)