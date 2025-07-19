// app/elections/[id]/page.tsx
import UnsafeServerSideHtmlRenderer from '@/components/UnsafeServerSideHtmlRenderer'
import { db } from '@/lib/kysely'
import { notFound } from 'next/navigation'

export const revalidate = 300 // 5 min

interface ElectionsPageProps {
  params: {
    id: string
  }
}

export default async function ElectionsPage({ params }: ElectionsPageProps) {
  const electionId = Number(params.id)
  if (isNaN(electionId)) return notFound()

  const election = await db
    .selectFrom('election')
    .where('id', '=', electionId)
    .selectAll()
    .executeTakeFirst()

  if (!election) return notFound()

  return (
    <main className="p-6">
      <h1 className='text-3xl'>{election?.name}</h1>
      <UnsafeServerSideHtmlRenderer htmlContent={election?.description} reduceHeadingSize />
    </main>
  )
}
