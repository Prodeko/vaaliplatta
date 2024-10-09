import { useAppState } from "../hooks/useAppState"

export default function TopHeaderBar() {
    const { election } = useAppState()
    return (
        <>
            <h1 className="text-6xl p-16 font-semibold text-white">{election?.name ?? "Vaaliplatta"}</h1>
        </>
    )
}