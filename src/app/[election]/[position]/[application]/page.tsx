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
            <div className={`prose prose-neutral dark:prose-invert m-4
            ${true && "prose-h1:text-lg prose-h2:text-base prose-h3:text-base prose-h4:text-base prose-h5:text-base prose-h6:text-base"}`}>
                {application.applicant_name + " "}
                <UnsafeServerSideHtmlRenderer htmlContent={application.content} reduceHeadingSize />
            </div>
        </>
    )
}