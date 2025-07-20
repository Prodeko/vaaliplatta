import { Logo } from "@prodeko/visual-assets/react/logos";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DarkModeToggle } from "./DarkModeToggle";
import { SidebarTrigger } from "./ui/sidebar";

export default function HeaderBar() {
    return (
        <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
            <div className="flex justify-between h-(--header-height) w-full items-center gap-2">
                <div className="flex flex-row items-center">
                    <Logo className="h-12 w-auto m-2 text-prodeko-dark dark:text-white" />
                    <SidebarTrigger />
                </div>
                <p className="text-3xl">Vaaliplatta</p>
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