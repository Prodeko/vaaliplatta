import { AppSidebar } from "@/components/AppSidebar"
import HeaderBar from "@/components/HeaderBar"
import {
    SidebarInset,
} from "@/components/ui/sidebar"
import fetcher from "@/lib/fetcher"

export default async function RootLayout({
    params,
    children,
}: {
    params: Promise<{ election: string }>,
    children: React.ReactNode
}) {
    const electionId = Number((await params).election)

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