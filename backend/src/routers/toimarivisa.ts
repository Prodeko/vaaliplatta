import { Router } from "express";
import { z } from 'zod';
import { validateData } from "../middleware/validators";
import { db } from "../database";

// Toimarivisa results are stored anonymously for statistics. The quiz itself
// runs in the browser, so this only records what was answered and suggested.
// Nothing that identifies the user (session, IP address, cookie) is saved.

const toimarivisaRouter = Router();

const resultSchema = z.object({
    election_id: z.number().int(),
    answers: z.record(
        z.string().max(50),
        z.array(z.number().int().min(0).max(50)).max(10),
    ).refine(answers => Object.keys(answers).length <= 30, "too many questions"),
    top_results: z.array(z.string().max(100)).max(3),
});

type ResultBody = z.infer<typeof resultSchema>

toimarivisaRouter.post('/result', validateData(resultSchema), async (req, res, next) => {
    try {
        const body: ResultBody = req.body

        // Only running elections offer the quiz
        const election = await db
            .selectFrom("election")
            .select("id")
            .where("id", "=", body.election_id)
            .where("state", "=", "open")
            .executeTakeFirst()

        if (!election) return res.status(404).json({ message: 'Election not found' })

        await db
            .insertInto("toimarivisa_result")
            .values({
                election_id: body.election_id,
                answers: JSON.stringify(body.answers),
                top_results: body.top_results,
            })
            .execute()

        res.status(201).send()
    } catch (error) {
        next(error)
    }
})

export default toimarivisaRouter
