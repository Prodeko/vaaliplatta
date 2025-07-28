import BreadcrumbSetter from '@/components/BreadcrumbSetter'
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

    const data = await db
        .selectFrom('election')
        .innerJoin('position', 'position.election_id', 'election.id')
        .where('position.id', '=', positionId)
        .where('election.id', '=', electionId)
        .select(['position.description', 'position.name as position_name', 'election.name as election_name'])
        .executeTakeFirst()

    if (!data) return notFound()

    return (
        <>
            <BreadcrumbSetter items={[
                { href: `/${electionId}`, label: data.election_name },
                { href: `/${electionId}/${positionId}`, label: data.position_name }
            ]} />

            <div>
                <h1 className='text-3xl'>{data.position_name}</h1>
                <UnsafeServerSideHtmlRenderer htmlContent={data?.description} reduceHeadingSize />
            </div>
        </>
    )
}
