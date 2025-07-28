import BreadcrumbSetter from '@/components/BreadcrumbSetter'
import UnsafeServerSideHtmlRenderer from '@/components/UnsafeServerSideHtmlRenderer'
import { db } from '@/lib/kysely'
import { notFound } from 'next/navigation'

export const revalidate = 300 // 5 min

interface ElectionsPageProps {
  params: {
    election: string
  }
}

export default async function ElectionsPage({ params }: ElectionsPageProps) {
  const electionId = Number((await params).election) // 'params' should be awaited before using its properties. 
  if (isNaN(electionId)) return notFound()

  const election = await db
    .selectFrom('election')
    .where('id', '=', electionId)
    .selectAll()
    .executeTakeFirst()

  if (!election) return notFound()

  return (
    <div>
      <BreadcrumbSetter items={[{ href: `/${electionId}`, label: election.name }]} />
      <h1 className='text-3xl'>{election?.name}</h1>
      <UnsafeServerSideHtmlRenderer htmlContent={election?.description} reduceHeadingSize />
    </div>
  )
}
