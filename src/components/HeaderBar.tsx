"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DarkModeToggle } from "./DarkModeToggle";
import { SidebarTrigger } from "./ui/sidebar";
import { Separator } from "./ui/separator";
import { SearchForm } from './SearchForm';
import AppBreadcrumb from "./AppBreadcrumb";

export default function HeaderBar() {

    return (
        <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
            <div className="flex h-(--header-height) w-full items-center">
                <SidebarTrigger className="m-4" />
                <Separator orientation="vertical" className="bg-foreground" />
                <AppBreadcrumb />
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