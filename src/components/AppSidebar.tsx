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

export function AppSidebar({ positions, ...props }: { positions: Selectable<Position>[], props?: React.ComponentProps<typeof Sidebar> }) {
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
                                    {cat.group.map((subItem) => (
                                        <SidebarMenuSubItem key={subItem.id}>
                                            <SidebarMenuSubButton asChild>
                                                <a>
                                                    <span>{subItem.name}</span>
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