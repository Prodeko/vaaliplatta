import { Kysely } from 'kysely'


// Let's add the ON DELETE CASCADE clause into the answer table to allow
// deleting questions which already have been answered.

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('answer')
        .dropConstraint('answer_question_id_fkey')
        .execute()

    await db.schema
        .alterTable('answer')
        .addForeignKeyConstraint('answer_question_id_fkey', ['question_id'], 'question', ['id'])
        .onDelete('cascade')
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('answer')
        .dropConstraint('answer_question_id_fkey')
        .execute()

    await db.schema
        .alterTable('answer')
        .addForeignKeyConstraint('answer_question_id_fkey', ['question_id'], 'question', ['id'])
        .execute()
}