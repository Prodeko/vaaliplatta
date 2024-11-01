import { useNavigate } from "react-router"
import { Application, Position, useAppState } from "../hooks/useAppState"
import { useAuth } from "../hooks/useAuth"
import Divider from "./Divider"
import HtmlRenderer from "./HtmlRenderer"
import Loading from "./Loading"
import QuestionAnswerSection from "./QuestionAnswerSection"
import useConfig from "../hooks/useConfig"

interface ApplicationCardProps {
    application: Application
}

function ApplicationCard({ application }: ApplicationCardProps) {
    const { showApplication } = useAppState();
    const { BLOB_URL } = useConfig();

    return (
        <div className="">
            <button
                onClick={() => showApplication(application.id)}
                className="p-2 text-sm text-gray-700 hover:bg-blue-100 w-full flex justify-between items-center"
            >
                <h1 className='p-2 text-black text-md font-extrabold rounded-md max-w-full overflow-auto'>{application?.applicant_name}</h1>
                <img
                    src={application.profile_picture ?? BLOB_URL + "/PRODEKO.png"}
                    className="w-12 h-12 mx-2 aspect-square object-cover rounded-full"
                />
            </button>
        </div>
    )
}

interface PositionProps {
    position: Position | "loading"
}

export default function PositionView({ position }: PositionProps) {
    const { setShowApplicationForm, setShowAdminEditApplicantsForm } = useAppState()
    const { token, user, superuser } = useAuth()
    const navigate = useNavigate()

    function showApplicationForm() {
        if (token) setShowApplicationForm(true)
        else navigate("/login")
    }

    function addApplicants() {
        setShowAdminEditApplicantsForm(true)
    }

    if (position === "loading") return <Loading />

    const editing: boolean = (!!user && position.applications?.map(a => a.applicant_id).includes(user))

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
                {superuser && <button className="w-full p-4 mb-2 text-black font-extrabold rounded-md shadow-inner shadow-red-50 hover:bg-red-100 bg-red-50 border-2 border-red-50 hover:border-red-500 flex items-start"
                    onClick={addApplicants}
                >
                    Muokkaa hakijoita (admin)
                </button>}
                <button className="w-full p-4 text-black font-extrabold rounded-md hover:bg-blue-100 bg-blue-50 flex items-start animate-bg-fade "
                    onClick={showApplicationForm}
                >
                    {editing ? "Muokkaa hakemusta" : "Hae virkaan"}
                </button>
                <Divider />

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
                <HtmlRenderer htmlContent={position?.description} />
                <QuestionAnswerSection />
            </div>
        </>
    )
}