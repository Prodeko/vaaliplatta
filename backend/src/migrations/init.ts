import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('election')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('name', 'text', col => col.unique().notNull())
        .addColumn('draft', 'boolean')
        .execute()
    await db.schema
        .createTable('position')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('name', 'text', col => col.notNull())
        .addColumn('description', 'text')
        .addColumn('seats', 'text') // Text type to allow for example "8 - 12" seats
        .addColumn('election.id', 'integer',
            col => col.references('election.id').notNull())
        .execute()
    await db.schema
        .createTable('application')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('content', 'text')
        .addColumn('applicant.name', 'text', col => col.notNull())
        .addColumn('applicant.id', 'text', col => col.notNull())
        .addColumn('position.id', 'integer', col =>
            col.references('position.id').notNull())
        .execute()
    await db.schema
        .createTable('question')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('title', 'text', col => col.notNull())
        .addColumn('content', 'text')
        .addColumn('nickname', 'text', col => col.notNull())
        .addColumn('asker.id', 'text', col => col.notNull())
        .addColumn('position.id', 'integer', col =>
            col.references('position.id').notNull())
        .execute()
    await db.schema
        .createTable('answer')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('title', 'text', col => col.notNull())
        .addColumn('content', 'text')
        .addColumn('question.id', 'integer', col =>
            col.references('question.id').notNull())
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('election').execute()
    await db.schema.dropTable('position').execute()
    await db.schema.dropTable('application').execute()
    await db.schema.dropTable('question').execute()
    await db.schema.dropTable('answer').execute()
}