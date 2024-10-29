import { NextFunction, Response, Router } from "express";
import { z } from 'zod';
import { validateData, validateRouteParams } from "../middleware/validators";
import { db } from "../database";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { AuthenticatedRequest, requireAuthenticated, requireSuperUser } from "../middleware/auth";

const positionRouter = Router();

export const createNewPositionSchema = z.object({
    name: z.string(),
    description: z.string(),
    seats: z.string(),
    election_id: z.number(),
    category: z.string()
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

positionRouter.get('/:id', validateRouteParams(idRouteParamsSchema), async (req, res, next) => {
    const id = parseInt(req.params.id!)

    db
        .selectFrom("position")
        .where("id", "=", id)
        .selectAll()
        .select(eb => jsonArrayFrom(
            eb.selectFrom("application")
                .selectAll()
                .whereRef("application.position_id", "=", "position.id")
        ).as("applications"))
        .select(eb => jsonArrayFrom(
            eb.selectFrom("question")
                .selectAll()
                .select(eb => jsonArrayFrom(
                    eb.selectFrom("answer")
                        .leftJoin("application", "answer.answerer_id", "application.applicant_id")
                        .select(["answer.id as answer_id", "answer.content as content", "question_id", "answerer_id", "profile_picture", "applicant_name", "applicant_id", "position_id"])
                        .whereRef("answer.question_id", "=", "question.id")
                ).as("answers"))
                .whereRef("question.position_id", "=", "position.id")
        ).as("questions"))
        .executeTakeFirst()
        .then(result => res.status(200).json(result))
        .catch(err => next(err))
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
