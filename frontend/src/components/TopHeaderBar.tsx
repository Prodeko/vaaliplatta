import { useAppState } from "../hooks/useAppState"
import { useAuth } from "../hooks/useAuth"
import useSchedulerView from "../hooks/useSchedulerView"

export default function TopHeaderBar() {
    const { election, position, clearPosition } = useAppState()
    const { login, logout, session } = useAuth()
    const { isSchedulerOpen, closeScheduler } = useSchedulerView()

    function handleClick() {
        console.log("handle click")
        if (session) logout()
        else login()
    }

    const showScheduler = !position && isSchedulerOpen && !!session?.is_superuser

    const text = position && position !== "loading"
        ? position.name
        : showScheduler
            ? "Hakuaikataulut"
            : election?.name || "Vaaliplatta"

    return (
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 p-8 md:p-12">
                {(position || showScheduler) && (
                    <button
                        onClick={position ? clearPosition : closeScheduler}
                        aria-label="Etusivulle"
                        title="Etusivulle"
                        className="shrink-0 flex items-center justify-center w-10 h-10 md:w-14 md:h-14 rounded-full border-2 border-transparent hover:border-white transition duration-300 focus:outline-none"
                    >
                        <svg viewBox="0 0 20 20" fill="white" className="w-8 h-8 md:w-12 md:h-12">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                )}
                <div>
                    <h1 className="font-semibold text-white text-3xl sm:text-4xl md:text-6xl">{text}</h1>
                    {showScheduler && election && (
                        <p className="mt-1 text-white md:text-xl">{election.name}</p>
                    )}
                </div>
            </div>
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
