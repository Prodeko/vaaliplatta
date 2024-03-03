import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('jobs')
        .addColumn('title', 'text', (col) => col.primaryKey())
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('jobs').execute()
}