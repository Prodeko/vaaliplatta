import { Kysely, sql } from 'kysely'

// This migration adds the enumerated type state with values
// draft, open, closed and archived. Closed type is meant to
// be used to temporarily close applications to a position. 
// Archived is added here for use with possible new features.

export async function up(db: Kysely<any>): Promise<void> {

    await db.schema
        .createType('state')
        .asEnum(['draft', 'open', 'closed', 'archived'])
        .execute()

    await db.schema
        .alterTable('position')
        .addColumn('state', sql`state`, col => col
            .defaultTo('draft')
            .notNull())
        .execute()

    await db
        .updateTable('position')
        .set({ state: 'open' })
        .execute()

    await db.schema
        .alterTable('election')
        .dropColumn('draft')
        .addColumn('state', sql`state`, col => col
            .defaultTo('draft')
            .notNull())
        .execute()

    await db
        .updateTable('election')
        .set({ state: 'open' })
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {

    await db.schema
        .alterTable('position')
        .dropColumn('state')
        .execute()

    await db.schema
        .alterTable('election')
        .dropColumn('state')
        .addColumn('draft', 'boolean')
        .execute()

    await db.schema
        .dropType('state')
        .execute()
}