import { Application, Position, useAppState } from "../hooks/useAppState"
import Loading from "./Loading"

interface ApplicationCardProps {
    application: Application
}

function ApplicationCard({ application }: ApplicationCardProps) {
    const { showApplication } = useAppState()

    return (
        <div className="">
            <button
                onClick={() => showApplication(application.applicant_id)}
                className="p-4 text-sm text-gray-700 hover:bg-blue-100 w-full flex items-start"
            >
                {application.applicant_name}
            </button>
        </div>
    )
}

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
                <div className="w-full p-4 text-black font-extrabold rounded-md">
                    Hakijat
                </div>
                <div className="rounded-md shadow-lg overflow-hidden">
                    {position.applications?.map(a => <ApplicationCard application={a} key={a.applicant_id} />)}
                </div>
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