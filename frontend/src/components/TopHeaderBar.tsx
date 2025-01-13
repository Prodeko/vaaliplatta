import { useAppState } from "../hooks/useAppState"
import { useAuth } from "../hooks/useAuth"

export default function TopHeaderBar() {
    const { election, position } = useAppState()
    const { login, logout, session } = useAuth()

    function handleClick() {
        console.log("handle click")
        if (session) logout()
        else login()
    }

    const text = position && position !== "loading"
        ? position.name
        : election?.name || "Vaaliplatta"

    return (
        <div className="flex justify-between items-center">
            <h1 className="font-semibold text-white
                p-8 text-3xl
                sm:p-8 sm:text-4xl
                md:p-12 md:text-6xl
                lg:p-12 lg:text-6xl
                xl:p-12 xl:text-6xl
                2xl:p-12 2xl:text-6xl
                ">{text}</h1>
            <div className="m-8 sm:m-6 md:m-12 lg:m-12 xl:m-12 2xl:m-12 relative inline-block group">
                <button
                    onClick={handleClick}
                    className="cursor-pointer group flex items-center justify-center w-16 h-16 rounded-full border-2 border-transparent hover:border-white transition duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 16 16">
                        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
                    </svg>
                </button>
                <span className="opacity-0 group-hover:opacity-100 max-w-md pointer-events-none absolute left-1/2 transform -translate-x-1/2 top-16 w-max rounded bg-gray-900 px-2 py-1 text-sm font-medium text-gray-50 shadow transition-opacity">
                    {session ? "logout" : "login"}
                </span>
            </div>
        </div>
    )
}
