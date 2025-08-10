import BreadcrumbSetter from "@/components/BreadcrumbSetter"
import UnsafeServerSideHtmlRenderer from "@/components/UnsafeServerSideHtmlRenderer"
import { db } from "@/lib/kysely"
import { notFound } from "next/navigation"


interface ApplicationPageProps {
    params: {
        election: string,
        position: string,
        application: string,
    }
}

export default async function Page({ params }: ApplicationPageProps) {
    const BLOB_URL = "TODO"

    const electionId = Number((await params).election)
    const positionId = Number((await params).position)
    const applicationId = Number((await params).application)
    if (isNaN(electionId)) return notFound()
    if (isNaN(positionId)) return notFound()
    if (isNaN(applicationId)) return notFound()

    const application = await db
        .selectFrom('application')
        .where('id', '=', applicationId)
        .selectAll()
        .executeTakeFirst()

    const data = await db
        .selectFrom('election')
        .innerJoin('position', 'position.election_id', 'election.id')
        .where('position.id', '=', positionId)
        .where('election.id', '=', electionId)
        .select(['position.name as position_name', 'election.name as election_name'])
        .executeTakeFirst()

    if (!application) return notFound()
    if (!data) return notFound()

    return (
        <>
            <BreadcrumbSetter items={[
                { href: `/${electionId}`, label: data.election_name },
                { href: `/${electionId}/${positionId}`, label: data.position_name },
                { href: `/${electionId}/${positionId}/${applicationId}`, label: application.applicant_name },
            ]} />
            <div>
                <div className="w-full flex items-center max-w-2xl">
                    <img
                        src={application.profile_picture ?? BLOB_URL + "/PRODEKO.png"}
                        className="w-24 h-24 m-2 aspect-square object-cover rounded-full"
                    />
                    <div className="m-4">
                        <h1 className="font-semibold overflow-auto text-2xl">{application.applicant_name}</h1>
                        <p className="text-sm">Hakee virkaan {data.position_name}</p>
                    </div>
                </div>
                <UnsafeServerSideHtmlRenderer htmlContent={application.content} reduceHeadingSize />
            </div>
        </>
    )
}