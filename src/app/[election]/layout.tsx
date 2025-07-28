import { AppSidebar } from "@/components/AppSidebar"
import HeaderBar from "@/components/HeaderBar"
import {
    SidebarInset,
} from "@/components/ui/sidebar"
import { createZodFetcher } from "@/lib/fetcher"
import { PositionSchema } from "@/lib/zod-validators"
import z from "zod"

const fetcher = createZodFetcher(z.array(PositionSchema))

export default async function RootLayout({
    params,
    children,
}: {
    params: Promise<{ election: string }>,
    children: React.ReactNode
}) {
    const electionId = (await params).election
    const positions = await fetcher(`http://localhost:3000/api/position?election_id=${electionId}`)

    return (
        <>
            <HeaderBar />
            <div className="flex flex-1">
                <AppSidebar initialData={positions} />
                <SidebarInset>
                    <main className="p-4">
                        {children}
                    </main>
                </SidebarInset>
            </div>
        </>
    )
}