"use client"

import * as React from "react"

import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
} from "@/components/ui/sidebar"
import { Position } from "@/lib/db"
import { Selectable } from "kysely"
import { groupBy } from "lodash"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible"
import { ChevronDown } from "lucide-react"
import useSWR from "swr"
import fetcher from "@/lib/fetcher"

export function AppSidebar({ initialData, ...props }: { initialData: Selectable<Position>[], props?: React.ComponentProps<typeof Sidebar> }) {
    const { data }: { data: Selectable<Position>[] } = useSWR('/api/position?election_id=1', fetcher, {
        fallbackData: initialData
    })
    const positions = data
    return (
        <Sidebar
            className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
            {...props}
        >
            <SidebarHeader>
            </SidebarHeader>
            <SidebarContent>
                <ElectionNav positions={positions} />
            </SidebarContent>
            <SidebarFooter>
            </SidebarFooter>
        </Sidebar>
    )
}

export function ElectionNav({
    positions }: { positions: Selectable<Position>[] }) {

    const { hallitus, vastuutoimarit, toimarit } = groupBy(positions, p => p.category)
    const categories = [
        { group: hallitus, label: "HALLITUS" },
        { group: vastuutoimarit, label: "VASTUUTOIMARIT" },
        { group: toimarit, label: "TOIMARIT" }
    ]

    return (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>Toimarivirat vuodelle 2026</SidebarGroupLabel>
            <SidebarMenu>
                {categories.map((cat) => (
                    <Collapsible key={cat.label} asChild defaultOpen>
                        <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                                <SidebarMenuButton>
                                    <span className="w-full">{cat.label}</span>
                                    <ChevronDown />
                                </SidebarMenuButton>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                                <SidebarMenuSub>
                                    {cat.group?.map((pos) => (
                                        <SidebarMenuSubItem key={pos.id}>
                                            <SidebarMenuSubButton asChild>
                                                <a href={`/${pos.election_id}/${pos.id}`}>
                                                    <span>{pos.name}</span>
                                                </a>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                    ))}
                                </SidebarMenuSub>
                            </CollapsibleContent>
                        </SidebarMenuItem>
                    </Collapsible>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    )
}