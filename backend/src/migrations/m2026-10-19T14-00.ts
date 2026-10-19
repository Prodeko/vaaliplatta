import { Kysely } from 'kysely'

// Adds a per-election setting for showing the toimarivisa on the front page
// and in the side menu. The quiz itself is always reachable with a direct link.

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('election')
        .addColumn('show_toimarivisa', 'boolean', col => col.defaultTo(false).notNull())
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.alterTable('election').dropColumn('show_toimarivisa').execute()
}
