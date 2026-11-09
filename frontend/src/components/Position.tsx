import { useNavigate } from "react-router"
import { Application, Position, State, useAppState } from "../hooks/useAppState"
import { useAuth } from "../hooks/useAuth"
import Divider from "./Divider"
import HtmlRenderer from "./HtmlRenderer"
import Loading from "./Loading"
import QuestionAnswerSection from "./QuestionAnswerSection"
import useConfig from "../hooks/useConfig"
import useAuthenticatedRequests from "../hooks/useAuthenticatedRequests"
import AdminButtons from './AdminButtons';
import useSchedulerView from "../hooks/useSchedulerView"
import { formatDateTime } from "../utils/formatDateTime"
import ApplicationAuthor from "./ApplicationAuthor"

interface ApplicationCardProps {
    application: Application
}

function ApplicationCard({ application }: ApplicationCardProps) {
    const { showApplication } = useAppState();
    const { BLOB_URL } = useConfig();
    const { session } = useAuth()

    return (
        <div className="">
            <button
                onClick={() => showApplication(application.id)}
                className="p-2 text-sm text-gray-700 hover:bg-blue-100 w-full flex justify-between items-center"
            >
                <div className='p-2 max-w-full overflow-auto text-left'>
                    <h1 className='text-black text-md font-extrabold'>{application.applicant_name}</h1>
                    <ApplicationAuthor application={application} className="text-xs" />
                </div>
                <div className="flex flex-row items-center flex-shrink-0">
                    {!application.time && session && <p className="p-2 text-blue-500 font-extrabold">uusi</p>}
                    <img
                        src={application.profile_picture ?? BLOB_URL + "/PRODEKO.png"}
                        className="w-12 h-12 mx-2 aspect-square object-cover rounded-full"
                    />
                </div>
            </button>
        </div>
    )
}

interface PositionProps {
    position: Position | "loading"
}

export default function PositionView({ position }: PositionProps) {
    const { setShowApplicationForm, setShowAdminEditApplicantsForm, getPosition, setShowAdminEditPositionDescriptionModal, clearPosition } = useAppState()
    const { openScheduler } = useSchedulerView()
    const { session } = useAuth()
    const { put } = useAuthenticatedRequests()
    const navigate = useNavigate()

    function showApplicationForm() {
        if (session) setShowApplicationForm(true)
        else navigate("/login")
    }

    function addApplicants() {
        setShowAdminEditApplicantsForm(true)
    }

    function toggleStateClosed() {
        if (position === "loading") return

        let newState: State
        if (position.state === State.OPEN) {
            newState = State.CLOSED
        } else {
            newState = State.OPEN
        }

        put(`/position/${position.id}`, { state: newState })
            .then(() => getPosition(position.id.toString()))
            .catch(err => console.error(err))
    }

    function showSchedule(scheduleId: number) {
        clearPosition()
        openScheduler(scheduleId)
    }

    function editDescription() {
        setShowAdminEditPositionDescriptionModal(true)
    }

    if (position === "loading") return <Loading />

    const editing: boolean = (!!session && position.applications?.map(a => String(a.applicant_id)).includes(String(session.pk)))

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
                {position.state === State.OPEN
                    ? <button className="w-full p-4 text-black font-extrabold rounded-md hover:bg-blue-100 bg-blue-50 flex items-start animate-bg-fade "
                        onClick={showApplicationForm}
                    >
                        {editing ? "Muokkaa hakemusta" : "Hae virkaan"}
                    </button>
                    : <button className="w-full p-4 text-gray-700 font-extrabold rounded-md bg-gray-50 flex items-start"
                        disabled
                        onClick={() => { }}
                    >
                        {position.state === State.CLOSED && position.next_opens_at
                            ? `Haku aukeaa ${formatDateTime(position.next_opens_at)}`
                            : "Hakeminen on päättynyt"}
                    </button>
                }
                <Divider />

                <div className="rounded-md overflow-hidden">
                    {position.applications?.length === 0
                        ? <div className="px-4">Ei vielä hakemuksia</div>
                        : position.applications?.map(a => <ApplicationCard application={a} key={a.applicant_id} />)}
                </div>
                {session?.is_superuser &&
                    <>
                        <Divider />
                        <AdminButtons
                            positionState={position.state}
                            onToggleStateClosed={toggleStateClosed}
                            onAddApplicants={addApplicants}
                            onEditDescription={editDescription}
                        />
                        {position.schedules && position.schedules.length > 0 && (
                            <div className="mt-2 rounded-md bg-gray-50 p-4">
                                <p className="font-extrabold text-black">Hakuaikataulut</p>
                                {position.schedules.map(schedule => (
                                    <button
                                        key={schedule.id}
                                        onClick={() => showSchedule(schedule.id)}
                                        className="mt-2 w-full rounded-md p-2 text-left text-sm hover:bg-blue-100"
                                    >
                                        <span className="block font-bold text-gray-800">{schedule.name}</span>
                                        <span className="block text-gray-600">
                                            {formatDateTime(schedule.opens_at)} → {formatDateTime(schedule.closes_at)}
                                        </span>
                                    </button>
                                ))}
                                <p className="mt-2 text-xs text-gray-500">
                                    Käsin avaaminen tai sulkeminen on voimassa seuraavaan aikataulun muutokseen asti.
                                </p>
                            </div>
                        )}
                    </>
                }
            </div>
            <div className="
                order-1
                md:col-span-4
                lg:col-span-5
                xl:col-span-6
                2xl:col-span-6">
                <HtmlRenderer htmlContent={position?.description} />
                <QuestionAnswerSection />
            </div>
        </>
    )
}