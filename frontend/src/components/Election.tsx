import { useAppState } from "../hooks/useAppState"
import useConfig from "../hooks/useConfig"
import HtmlRenderer from "./HtmlRenderer"
import Loading from "./Loading"
import { useAuth } from "../hooks/useAuth"

export default function Election() {
  const { election, setShowAdminEditElectionModal } = useAppState()
  const { BLOB_URL } = useConfig()
  const { session } = useAuth()

  return (
    <div className="my-4">
      {session?.is_superuser && election && (
        <button
          onClick={() => setShowAdminEditElectionModal(true)}
          className="w-full p-4 mb-2 text-black font-extrabold rounded-md shadow-inner shadow-red-50 hover:bg-red-100 bg-red-50 border-2 border-red-50 hover:border-red-500 flex items-start"
        >
          Muokkaa vaaleja
        </button>
      )}
      {election?.description ? <HtmlRenderer htmlContent={election?.description} /> : <Loading />}
      <img src={`${BLOB_URL}/logate.jpg`} alt="Logate logo" className="max-w-xs m-4 mt-12"></img>
    </div>)
}
