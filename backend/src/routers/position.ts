import { NextFunction, Response, Router } from "express";
import { z } from 'zod';
import { validateData, validateRouteParams } from "../middleware/validators";
import { db } from "../database";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { AuthenticatedRequest, requireAuthenticated, requireSuperUser } from "../middleware/auth";
import { ExpressionBuilder } from "kysely";
import { DB } from "../db";

const positionRouter = Router();

export const createNewPositionSchema = z.object({
    name: z.string(),
    description: z.string(),
    seats: z.string(),
    election_id: z.number(),
    category: z.string(),
    state: z.enum(["draft", "open", "closed", "archived"]).optional()
});

type createNewPositionType = z.infer<typeof createNewPositionSchema>

positionRouter.post('/', requireSuperUser, validateData(createNewPositionSchema), async (req, res, next) => {
    const data: createNewPositionType = req.body

    db
        .insertInto('position')
        .values(data)
        .returningAll()
        .executeTakeFirst()
        .then(result => res.status(201).json(result))
        .catch(e => next(e))
});

const idRouteParamsSchema = z.object({
    id: z.string(),
})

export const updatePositionSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    seats: z.string().optional(),
    category: z.string().optional(),
    state: z.enum(["draft", "open", "closed", "archived"]).optional(),
});

positionRouter.put(
    '/:id',
    requireSuperUser,
    validateData(updatePositionSchema),
    validateRouteParams(idRouteParamsSchema),
    async (req, res, next) => {
        try {
            const id = parseInt(req.params.id!)
            const data: createNewPositionType = req.body

            const result = await db
                .updateTable('position')
                .set(data)
                .where('id', '=', id)
                .returningAll()
                .executeTakeFirst()

            res.status(200).json(result)

        } catch (error) {
            next(error)
        }
    }
)

positionRouter.get('/:id', validateRouteParams(idRouteParamsSchema), async (req: AuthenticatedRequest, res, next) => {
    try {
        const id = parseInt(req.params.id!)
        const user = req.session?.pk || -1

        const applicationsJoinReadReceipts = (eb: ExpressionBuilder<DB, "position">) => jsonArrayFrom(
            eb.selectFrom("application")
                .leftJoin("read_receipts", join => join
                    .onRef("application.id", "=", "read_receipts.application_id")
                    .on("read_receipts.user_id", "=", user.toString())
                )
                .selectAll()
                .whereRef("application.position_id", "=", "position.id")).as("applications")


        const result = await db
            .selectFrom("position")
            .where("id", "=", id)
            .selectAll()
            .select(applicationsJoinReadReceipts)
            .select(eb => jsonArrayFrom(
                eb.selectFrom("question")
                    .selectAll()
                    .select(eb => jsonArrayFrom(
                        eb.selectFrom("answer")
                            .leftJoin("application", "answer.answerer_id", "application.applicant_id")
                            .select(["answer.id as answer_id", "answer.content as content", "question_id", "answerer_id", "profile_picture", "applicant_name", "applicant_id", "position_id"])
                            .whereRef("answer.question_id", "=", "question.id")
                            .where("application.position_id", "=", id)
                    ).as("answers"))
                    .whereRef("question.position_id", "=", "position.id")
            ).as("questions"))
            .executeTakeFirst()

        res.status(200).json(result)
    } catch (error) {
        next(error)
    }

})

positionRouter.delete(
    '/:id/myapplication',
    requireAuthenticated,
    validateRouteParams(idRouteParamsSchema),
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const position_id = parseInt(req.params.id!);
        const applicant_id = req.session?.pk

        if (!applicant_id) return res.status(400).send("Applicant id missing from auth session")

        try {
            await db.deleteFrom('application')
                .where('applicant_id', '=', applicant_id.toString())
                .where('position_id', '=', position_id)
                .execute()

            return res.status(204).send()
        } catch (error) {
            next(error)
        }
    })

positionRouter.delete('/:id', validateRouteParams(idRouteParamsSchema), async (req, res, next) => {
    const id = parseInt(req.params.id!);

    try {
        const result = await db
            .deleteFrom('position')
            .where('id', '=', id)
            .execute();

        // @ts-expect-error
        if (result.numUpdatedRows === 0) {
            return res.status(404).json({ message: 'Position not found' });
        }

        res.status(204).send(); // No content
    } catch (error) {
        next(error);
    }
});


export default positionRouter
