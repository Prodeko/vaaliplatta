import { Kysely, sql } from 'kysely'

// This migration adds schedules for application periods. A schedule is a
// time window during which applications to its positions are open, and a
// position can belong to several schedules.
//
// The position_effective view derives each position's state at query time,
// so no background job is needed to open or close applications. The most
// recent change wins: either a manual state change (position.state_changed_at)
// or a schedule event (a window opening or closing, or a schedule being
// saved). After a schedule event the position is open if now is inside any
// of its windows. A manual change therefore lasts until the next schedule
// event. Draft and archived positions always keep their state, and positions
// without schedules use their stored state as before.
//
// The view lists the position columns explicitly, so it has to be
// recreated if columns are added to the position table.

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable('position')
        .addColumn('state_changed_at', 'timestamptz')
        .execute()

    await db.schema
        .createTable('schedule')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('election_id', 'integer', col => col.references('election.id').onDelete('cascade').notNull())
        .addColumn('name', 'text', col => col.notNull())
        .addColumn('opens_at', 'timestamptz', col => col.notNull())
        .addColumn('closes_at', 'timestamptz', col => col.notNull())
        .addColumn('updated_at', 'timestamptz', col => col.defaultTo(sql`now()`).notNull())
        .addCheckConstraint('schedule_closes_after_opens', sql`closes_at > opens_at`)
        .execute()

    await db.schema
        .createTable('schedule_position')
        .addColumn('schedule_id', 'integer', col => col.references('schedule.id').onDelete('cascade').notNull())
        .addColumn('position_id', 'integer', col => col.references('position.id').onDelete('cascade').notNull())
        .addPrimaryKeyConstraint('schedule_position_pk', ['schedule_id', 'position_id'])
        .execute()

    await sql`
        CREATE VIEW position_effective AS
        SELECT
            p.id,
            p.name,
            p.description,
            p.seats,
            p.election_id,
            p.category,
            CASE
                WHEN p.state IN ('draft', 'archived') THEN p.state
                WHEN sched.last_event_at IS NULL THEN p.state
                WHEN p.state_changed_at > sched.last_event_at THEN p.state
                WHEN sched.in_window THEN 'open'::state
                ELSE 'closed'::state
            END AS state,
            sched.next_opens_at
        FROM position p
        CROSS JOIN LATERAL (
            SELECT
                coalesce(bool_or(now() >= s.opens_at AND now() < s.closes_at), false) AS in_window,
                max(greatest(
                    s.updated_at,
                    CASE WHEN s.opens_at <= now() THEN s.opens_at END,
                    CASE WHEN s.closes_at <= now() THEN s.closes_at END
                )) AS last_event_at,
                min(s.opens_at) FILTER (WHERE s.opens_at > now()) AS next_opens_at
            FROM schedule_position sp
            JOIN schedule s ON s.id = sp.schedule_id
            WHERE sp.position_id = p.id
        ) sched
    `.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropView('position_effective').execute()
    await db.schema.dropTable('schedule_position').execute()
    await db.schema.dropTable('schedule').execute()
    await db.schema.alterTable('position').dropColumn('state_changed_at').execute()
}
