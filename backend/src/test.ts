import { db } from './database'

export async function getJobs() {
    return await db.selectFrom('jobs')
        .selectAll()
        .executeTakeFirst()
}

