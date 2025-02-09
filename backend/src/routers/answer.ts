import { Router } from "express";
import { z } from 'zod';
import { validateRouteParams } from "../middleware/validators";
import { db } from "../database";
import { AuthenticatedRequest, requireAuthenticated } from "../middleware/auth";

const answerRouter = Router();

const idRouteParamsSchema = z.object({
    id: z.string(),
});

answerRouter.delete(
    '/:id',
    requireAuthenticated,
    validateRouteParams(idRouteParamsSchema),
    async (req: AuthenticatedRequest, res, next) => {
        try {
            const answer_id = parseInt(req.params.id!)
            const user_id = req.session?.pk.toString()!
            const is_superuser = !!req.session?.is_superuser

            const answer = await db
                .selectFrom("answer")
                .where("answer.id", "=", answer_id)
                .selectAll()
                .executeTakeFirst()

            if (answer?.answerer_id !== user_id && !is_superuser) return res.status(403).send("Cannot delete other people's answers!")

            const result = await db
                .deleteFrom("answer")
                .where("answer.id", "=", answer_id)
                .execute()

            return res.status(204).send()

        } catch (error) {
            next(error)
        }
    }
)

export default answerRouter
