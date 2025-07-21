"use client"

import useSWR from 'swr'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DarkModeToggle } from "./DarkModeToggle";
import { SidebarTrigger } from "./ui/sidebar";
import { Separator } from "./ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "./ui/breadcrumb";
import fetcher from "@/lib/fetcher";

// TODO accept initial data from the server
export default function HeaderBar() {
    const { data } = useSWR('/api/elections/1', fetcher)
    const election = data
    return (
        <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
            <div className="flex h-(--header-height) w-full items-center">
                <SidebarTrigger className="m-4" />
                <Separator orientation="vertical" className="bg-foreground" />
                <Breadcrumb className="hidden sm:block m-4">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">
                                Vaaliplatta
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        {election?.name &&
                            <>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>{election.name}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </>
                        }
                    </BreadcrumbList>
                </Breadcrumb>
                <div className="flex flex-row gap-2 m-2">
                    <DarkModeToggle className="" />
                    <Avatar className="">
                        <AvatarImage src="" />
                        <AvatarFallback>Hi</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </header>
    )
}