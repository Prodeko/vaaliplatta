import ApplicationChip from "@/components/ApplicationChip"
import { db } from "@/lib/kysely"
import { jsonArrayFrom } from "kysely/helpers/postgres"
import { notFound } from "next/navigation"
import React from "react"

export const revalidate = 300 // 5 min

interface LayoutProps {
    params: {
        election: string,
        position: string,
    },
    children: React.ReactNode
}

export default async function Layout({
    params,
    children,
}: LayoutProps) {
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
        .select(eb => jsonArrayFrom(
            eb.selectFrom('application')
                .where('application.position_id', '=', positionId)
                .select(['applicant_name', 'application.id', 'application.profile_picture'])
        ).as('applications'))
        .executeTakeFirst()

    if (!data) return notFound()

    return (
        <>
            <div className='block lg:flex lg:flex-row'>
                <div className='order-2'>
                    {data.applications.map(a => (
                        <ApplicationChip key={a.id} application={a} url={`/${electionId}/${positionId}/${a.id}`} />
                    ))}
                </div>
                <div className='order-1 w-full'>
                    {children}
                </div>
            </div>

        </>
    )
}