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
    const { setShowApplicationForm } = useAppState()

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
                <button className="w-full p-4 text-black font-extrabold rounded-md hover:bg-blue-100 bg-blue-50 flex sitems-start animate-bg-fade "
                    onClick={() => setShowApplicationForm(true)}
                >
                    Hae virkaan
                </button>
                <hr className="my-4 h-0.5 border-t-0 bg-gray-50" />

                <div className="rounded-md overflow-hidden">
                    {position.applications?.length === 0
                        ? <div className="px-4">Ei vielä hakemuksia</div>
                        : position.applications?.map(a => <ApplicationCard application={a} key={a.applicant_id} />)}
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