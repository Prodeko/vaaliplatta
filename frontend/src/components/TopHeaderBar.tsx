import { useAppState } from "../hooks/useAppState"

export default function TopHeaderBar() {
    const { election, position } = useAppState()

    const text = position && position !== "loading"
        ? position.name
        : election?.name || "Vaaliplatta"

    return (
        <>
            <h1 className="text-6xl font-semibold text-white
                p-8
                sm:p-8
                md:p-12
                lg:p-12
                xl:p-12
                2xl:p-12
            ">{text}</h1>
        </>
    )
}