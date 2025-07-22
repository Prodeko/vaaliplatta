"use client"

import useSWR from 'swr'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DarkModeToggle } from "./DarkModeToggle";
import { SidebarTrigger } from "./ui/sidebar";
import { Separator } from "./ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "./ui/breadcrumb";
import fetcher from "@/lib/fetcher";
import { Selectable } from 'kysely';
import { Election } from '@/lib/db';
import { SearchForm } from './SearchForm';

export default function HeaderBar({ initialData }: { initialData: Selectable<Election> }) {
    const { data }: { data: Selectable<Election> } = useSWR('/api/election?id=1', fetcher, {
        fallbackData: initialData
    })
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
                <SearchForm className="w-full sm:ml-auto sm:w-auto" />
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