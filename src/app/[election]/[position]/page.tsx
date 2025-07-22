import UnsafeServerSideHtmlRenderer from '@/components/UnsafeServerSideHtmlRenderer'
import { db } from '@/lib/kysely'
import { notFound } from 'next/navigation'

export const revalidate = 300 // 5 min

interface PositionsPageProps {
    params: {
        election: string,
        position: string,
    }
}

export default async function PositionPage({ params }: PositionsPageProps) {
    const electionId = Number((await params).election)
    const positionId = Number((await params).position)
    if (isNaN(electionId)) return notFound()
    if (isNaN(positionId)) return notFound()

    const position = await db
        .selectFrom('position')
        .where('id', '=', positionId)
        .where('election_id', '=', electionId)
        .selectAll()
        .executeTakeFirst()

    if (!position) return notFound()

    return (
        <div>
            <h1 className='text-3xl'>{position?.name}</h1>
            <UnsafeServerSideHtmlRenderer htmlContent={position?.description} reduceHeadingSize />
        </div>
    )
}
