// app/api/test/route.ts
import { db } from '@/lib/kysely'
import { NextResponse } from 'next/server'

export async function GET() {
    const rows = await db.selectFrom("election").selectAll().executeTakeFirst()
    return NextResponse.json(rows)
}
