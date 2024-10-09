import { Position } from "../hooks/useAppState"
import Loading from "./Loading"

interface PositionProps {
    position: Position | "loading"
}

export default function PositionView({ position }: PositionProps) {
    if (position === "loading") return <Loading />

    return (
        <div>
            {position?.toString()}
        </div>
    )
}