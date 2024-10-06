import { useElection } from "../hooks/useElection"

export default function TopHeaderBar() {
    const { election } = useElection()
    return (
        <>
            <h1 className="text-6xl p-16 font-semibold text-white">{election?.name}</h1>
        </>
    )
}