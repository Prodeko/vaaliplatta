import { db } from '@/lib/kysely'
import { SearchParamIdSchema } from '@/lib/zod-validators'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const raw = searchParams.get('election_id')
    const result = SearchParamIdSchema.safeParse(raw)
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 })
    const electionId = result.data

    const positions = await db
        .selectFrom('position')
        .where('election_id', '=', electionId)
        .selectAll()
        .limit(200)
        .execute()

    return NextResponse.json(positions)
}
