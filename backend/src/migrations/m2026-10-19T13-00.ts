import { Kysely, sql } from 'kysely'

// This migration adds a table for toimarivisa results. Results are stored
// anonymously for statistics: no user id, IP address or cookie is saved, only
// the answers, the suggested roles and the time.

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('toimarivisa_result')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('election_id', 'integer', col => col.references('election.id').onDelete('cascade').notNull())
        // Selected option indices per question id, e.g. {"ilta": [0], "tyokalu": [2, 5]}
        .addColumn('answers', 'jsonb', col => col.notNull())
        // Slugs of the suggested roles, best first
        .addColumn('top_results', sql`text[]`, col => col.notNull())
        .addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`now()`).notNull())
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('toimarivisa_result').execute()
}
