import { Position } from "../hooks/useAppState"

interface PositionProps {
    position: Position | "loading"
}

export default function PositionView({ position }: PositionProps) {
    return (
        <div>
            {position?.toString()}
        </div>
    )
}