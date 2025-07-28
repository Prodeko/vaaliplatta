import { z } from "zod"

function createZodFetcher<T>(schema: z.ZodType<T>) {
    return async (url: string): Promise<T> => {
        const res = await fetch(url)
        if (!res.ok) throw new Error("Fetch failed")
        const json = await res.json()
        const parsed = schema.safeParse(json)
        if (!parsed.success) throw parsed.error
        return parsed.data
    }
}

export { createZodFetcher }