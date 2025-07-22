import { db } from '@/lib/kysely'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const idParam = searchParams.get('id')

    if (!idParam) {
        return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    const id = Number(idParam)
    if (Number.isNaN(id)) {
        return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    }

    const election = await db
        .selectFrom("election")
        .where('id', '=', id)
        .selectAll()
        .executeTakeFirst()

    return NextResponse.json(election)
}
