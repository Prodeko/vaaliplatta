import { useAppState } from "../hooks/useAppState"

export default function Error() {
    const { error } = useAppState()
    return error
        ? <h1 className="text-xl p-16 font-semibold text-white bg-red-400">{error}</h1>
        : <></>
}