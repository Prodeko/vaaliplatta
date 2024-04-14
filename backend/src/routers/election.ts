import { db } from "@/database";
import { validateData } from "@/middleware/schemavalidator";
import { Router } from "express";
import { z } from 'zod';

const electionRouter = Router();


export const createNewElectionSchema = z.object({
    name: z.string(),
});
type createNewElectionType = z.infer<typeof createNewElectionSchema>

electionRouter.post('/', validateData(createNewElectionSchema), async (req, res) => {
    const data: createNewElectionType = req.body

    res.json(data)
});

export default electionRouter
