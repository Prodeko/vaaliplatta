import { Router } from "express";
import { array, z } from 'zod';
import { validateData, validateRouteParams } from "@/middleware/validators";
import { db } from "@/database";
import multer from 'multer'
import path from "path";
import { type } from "os";
import AzureBlobService from "@/utils/blobService";

export const applicationRouter = Router();
const memoryStorage = multer.memoryStorage(); // Use memory storage to buffer files before uploading
const upload = multer({ storage: memoryStorage });
const blobService = new AzureBlobService(process.env.BLOB_SAS_URL!)
export const createNewApplicationSchema = z.object({
    "content": z.string(),
    "applicant_name": z.string(),
    "applicant_id": z.string(),
    "position_id": z.string()
})

type createNewApplicationType = z.infer<typeof createNewApplicationSchema>

applicationRouter.post(
    '/',
    upload.array('files', 5),
    validateData(createNewApplicationSchema),
    async (req, res, next) => {
        const body: createNewApplicationType = req.body
        const data = { ...body, "position_id": parseInt(body.position_id) }
        const files = req.files as Express.Multer.File[] | undefined

        if (files) {
            await Promise.all(files.map(file => blobService.uploadBlob(file)))
        }

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

applicationRouter.delete('/:id', validateRouteParams(idRouteParamsSchema), async (req, res, next) => {
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