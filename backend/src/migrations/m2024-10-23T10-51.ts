import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('answer')
        .addColumn('answerer_id', 'text', col => col.notNull())
        .dropColumn('title')
        .execute()

    await db.schema
        .alterTable('question')
        .dropColumn('title')
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('question')
        .addColumn('title', 'text', col => col.notNull())
        .execute()

    await db.schema
        .alterTable('answer')
        .addColumn('title', 'text', col => col.notNull())
        .dropColumn('answerer_id')
        .execute()
}