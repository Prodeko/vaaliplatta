import { db } from '@/lib/kysely'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const electionIdParam = searchParams.get('election_id')

    if (!electionIdParam) {
        return NextResponse.json({ error: 'Missing election_id' }, { status: 400 })
    }

    const electionId = Number(electionIdParam)
    if (Number.isNaN(electionId)) {
        return NextResponse.json({ error: 'Invalid election_id' }, { status: 400 })
    }

    const positions = await db
        .selectFrom('position')
        .where('election_id', '=', electionId)
        .selectAll()
        .execute()

    return NextResponse.json(positions)
}
