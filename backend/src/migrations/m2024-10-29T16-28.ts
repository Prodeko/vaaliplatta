import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('position')
        .addColumn('category', 'text', col => col.defaultTo("hallitus").notNull())
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('position')
        .dropColumn('category')
        .execute()
}