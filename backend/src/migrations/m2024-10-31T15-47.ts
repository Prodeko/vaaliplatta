import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('read_receipts')
        .addColumn('application_id', 'integer', col => col.references('application.id').notNull())
        .addColumn('user_id', 'text', col => col.notNull())
        .addColumn('time', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .addPrimaryKeyConstraint('pk', ['application_id', 'user_id'])
        .execute()

    await db.schema.createView('read_receipts_with_election_id')
        .as(
            db.selectFrom('read_receipts')
                .innerJoin('application', 'application.id', 'read_receipts.application_id')
                .innerJoin('position', 'position.id', 'application.id')
                .select([
                    'read_receipts.application_id',
                    'position.election_id as election_id',
                    'read_receipts.user_id',
                    'read_receipts.time'
                ])
        ).execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema
        .dropTable('read_receipts')
        .execute()

    await db.schema
        .dropView('read_receipts_with_election_id')
        .execute()
}