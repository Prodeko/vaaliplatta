import { AppSidebar } from "@/components/AppSidebar"
import {
    SidebarInset,
} from "@/components/ui/sidebar"
import { db } from "@/lib/kysely"
import { notFound } from "next/navigation"

export default async function RootLayout({
    params,
    children,
}: {
    params: { id: string }
    children: React.ReactNode
}) {
    const electionId = Number((await params).id)

    const positions = await db
        .selectFrom('position')
        .where('election_id', '=', electionId)
        .selectAll()
        .execute()

    return (
        <div className="flex flex-1">
            <AppSidebar positions={positions} />
            <SidebarInset>
                <main className="p-4">
                    {children}
                </main>
            </SidebarInset>
        </div>
    )
}