import { Position } from "../hooks/useAppState"
import Loading from "./Loading"

interface PositionProps {
    position: Position | "loading"
}

export default function PositionView({ position }: PositionProps) {
    if (position === "loading") return <Loading />

    return (
        // Note that the css order property is not redundant here
        // as with screen sm, the display is set to block, and 
        // hakijat is rendered above the position.description
        <>
            <div className="
                order-2
                md:col-span-2
                lg:col-span-3
                xl:col-span-4
                2xl:col-span-4">
                <p>hakijat</p>
                <ul>
                    <li>foo</li>
                    <li>bar</li>
                    <li>spam</li>
                    <li>baz</li>
                </ul>
            </div>
            <div className="
                order-1
                md:col-span-4
                lg:col-span-5
                xl:col-span-6
                2xl:col-span-6">
                {position?.description}
            </div>
        </>
    )
}