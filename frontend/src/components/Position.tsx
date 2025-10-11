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
                <h1 className='p-2 text-black text-md font-extrabold rounded-md max-w-full overflow-auto'>{application?.applicant_name}</h1>
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
    const { setShowApplicationForm, setShowAdminEditApplicantsForm, getPosition, setShowAdminEditPositionDescriptionModal } = useAppState()
    const { BLOB_URL } = useConfig()
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

    function editDescription() {
        setShowAdminEditPositionDescriptionModal(true)
    }

    if (position === "loading") return <Loading />

    const editing: boolean = (!!session && position.applications?.map(a => a.applicant_id).includes(session.pk))

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
                        Hakeminen on päättynyt
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
                <img src={`${BLOB_URL}/logate.jpg`} alt="Logate logo" className="max-w-xs m-4 mt-12"></img>
            </div>
        </>
    )
}