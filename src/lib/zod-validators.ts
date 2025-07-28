import { z } from "zod"

export const StateSchema = z.enum(["archived", "closed", "draft", "open"])
export const DatabaseIdSchema = z.number().int().positive()

export const PositionSchema = z.object({
    id: DatabaseIdSchema,
    name: z.string(),
    category: z.string(),
    description: z.string().nullable(),
    election_id: z.number(),
    seats: z.string().nullable(),
    state: StateSchema,
})
export type Position = z.infer<typeof PositionSchema>

export const SearchParamIdSchema = z.coerce.number().int().positive()
export type SearchParamId = z.infer<typeof SearchParamIdSchema>

export const ElectionSchema = z.object({
    id: DatabaseIdSchema,
    name: z.string(),
    description: z.string().nullable(),
    state: StateSchema,
})
export type Election = z.infer<typeof ElectionSchema>