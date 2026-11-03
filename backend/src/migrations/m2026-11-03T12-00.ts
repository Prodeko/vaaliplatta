import { Kysely } from 'kysely'

// Stores the real name of the account an application belongs to, taken from
// the Keycloak session. applicant_name is free text chosen by the writer;
// author_name shows who actually submitted it.

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('application')
        .addColumn('author_name', 'text')
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.alterTable('application').dropColumn('author_name').execute()
}
