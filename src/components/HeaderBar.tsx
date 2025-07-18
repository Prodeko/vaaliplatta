import { Logo, LogoText } from "@prodeko/visual-assets/react/logos";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuIndicator,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    NavigationMenuViewport,
} from "@/components/ui/navigation-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DarkModeToggle } from "./DarkModeToggle";

export default function HeaderBar() {
    return (
        <header className="flex flex-row shadow-sm shadow-foreground/10 justify-between items-center">
            <Logo className="h-12 w-auto m-2 text-prodeko-dark dark:text-white" />
            <p className="text-3xl">Vaaliplatta</p>
            <div className="flex flex-row gap-2 m-2">
                <DarkModeToggle className="" />
                <Avatar className="">
                    <AvatarImage src="" />
                    <AvatarFallback>Hi</AvatarFallback>
                </Avatar>
            </div>
        </header>
    )
}