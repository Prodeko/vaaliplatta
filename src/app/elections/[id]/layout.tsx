import { AppSidebar } from "@/components/AppSidebar"
import {
    SidebarInset,
} from "@/components/ui/sidebar"

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-1">
            <AppSidebar />
            <SidebarInset>
                <main className="p-4">
                    {children}
                </main>
            </SidebarInset>
        </div>
    )
}