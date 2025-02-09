import { NextFunction, Response, Router } from "express";
import { z } from 'zod';
import { validateData, validateRouteParams } from "../middleware/validators";
import { db } from "../database";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { AuthenticatedRequest, requireAuthenticated, requireSuperUser } from "../middleware/auth";

const questionRouter = Router();

export const postQuestionSchema = z.object({
    content: z.string(),
    position_id: z.string(),
    nickname: z.string(),
});

type postQuestionType = z.infer<typeof postQuestionSchema>

questionRouter.post(
    '/',
    requireAuthenticated,
    validateData(postQuestionSchema),
    async (req: AuthenticatedRequest, res, next) => {
        try {
            const body: postQuestionType = req.body
            const asker_id = req.session?.pk?.toString()!
            const position_id = parseInt(body.position_id)

            const data = { ...body, position_id, asker_id }

            const result = await db
                .insertInto('question')
                .values(data)
                .returningAll()
                .executeTakeFirst()

            return res.status(201).json(result)

        } catch (error) {
            next(error)
        }
    });

export const postAnswerSchema = z.object({
    content: z.string(),
});

const idRouteParamsSchema = z.object({
    id: z.string(),
});

type postAnswerType = z.infer<typeof postAnswerSchema>

questionRouter.post(
    '/:id/answer',
    requireAuthenticated,
    validateData(postAnswerSchema),
    validateRouteParams(idRouteParamsSchema),
    async (req: AuthenticatedRequest, res, next) => {
        try {
            const body: postAnswerType = req.body
            const answerer_id = req.session?.pk?.toString()!
            const question_id = parseInt(req.params.id!)

            const question = await db
                .selectFrom("question")
                .where("question.id", "=", question_id)
                .selectAll()
                .executeTakeFirstOrThrow()

            // The person answering the question has to have applied to the position to which the question was posted to
            const answererHasApplied = !!await db
                .selectFrom("application")
                .where("applicant_id", "=", answerer_id)
                .where("position_id", "=", question.position_id)
                .selectAll()
                .executeTakeFirst()

            if (!answererHasApplied) return res.status(403).send("Cannot answer question to a position you haven't applied to!")

            const data = { ...body, question_id, answerer_id }

            const result = await db
                .insertInto('answer')
                .values(data)
                .returningAll()
                .executeTakeFirst()

            return res.status(201).json(result)

        } catch (error) {
            next(error)
        }
    });

questionRouter.delete(
    '/:id',
    requireAuthenticated,
    validateRouteParams(idRouteParamsSchema),
    async (req: AuthenticatedRequest, res, next) => {
        try {
            const question_id = parseInt(req.params.id!)
            const user_id = req.session?.pk.toString()!
            const is_superuser = !!req.session?.is_superuser

            const question = await db
                .selectFrom("question")
                .where("question.id", "=", question_id)
                .selectAll()
                .executeTakeFirst()

            if (question?.asker_id !== user_id && !is_superuser) return res.status(403).send("Cannot delete other people's questions!")

            const answers = await db
                .selectFrom("answer")
                .where("answer.question_id", "=", question_id)
                .selectAll()
                .execute()

            if (answers.length > 0 && !is_superuser) return res.status(403).send("Cannot delete a question if it already has answers!")

            const result = await db
                .deleteFrom("question")
                .where("question.id", "=", question_id)
                .execute()

            return res.status(204).send()

        } catch (error) {
            next(error)
        }
    }
)

export default questionRouter
