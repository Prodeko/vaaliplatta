import { db } from '@/lib/kysely'
import { SearchParamIdSchema } from '@/lib/zod-validators'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const raw = searchParams.get('id')
    const result = SearchParamIdSchema.safeParse(raw)
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 })
    const id = result.data

    const election = await db
        .selectFrom('election')
        .where('id', '=', id)
        .selectAll()
        .executeTakeFirst()

    if (!election) {
        return NextResponse.json({ error: 'Election not found' }, { status: 404 })
    }

    return NextResponse.json(election)
}
