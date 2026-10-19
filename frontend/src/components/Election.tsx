import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useAppState } from "../hooks/useAppState"
import type { Election as ElectionType } from "../hooks/useAppState"
import useAuthenticatedRequests from "../hooks/useAuthenticatedRequests"
import HtmlRenderer from "./HtmlRenderer"
import Loading from "./Loading"
import { useAuth } from "../hooks/useAuth"
import useSchedulerView from "../hooks/useSchedulerView"
import ToimarivisaCard from "./ToimarivisaCard"

type ElectionSummary = Pick<ElectionType, "id" | "name" | "state">

export default function Election() {
  const {
    election,
    setShowAdminEditElectionModal,
    setShowAdminCreateElectionModal,
    clearPosition,
  } = useAppState()
  const { session } = useAuth()
  const { openScheduler } = useSchedulerView()
  const { get } = useAuthenticatedRequests()
  const [searchParams, setSearchParams] = useSearchParams()
  const [browseOpen, setBrowseOpen] = useState(false)
  const [loadingElections, setLoadingElections] = useState(false)
  const [availableElections, setAvailableElections] = useState<ElectionSummary[]>([])
  const isAdmin = !!session?.is_superuser

  const handleBrowseClick = async () => {
    if (browseOpen) {
      setBrowseOpen(false)
      return
    }

    setBrowseOpen(true)
    if (availableElections.length > 0) return

    try {
      setLoadingElections(true)
      const response = await get("/election")
      const elections: ElectionSummary[] = Array.isArray(response.data) ? [...response.data] : []
      elections.sort((a, b) => b.id - a.id)
      setAvailableElections(elections)
    } catch (error) {
      console.error(error)
      setBrowseOpen(false)
    } finally {
      setLoadingElections(false)
    }
  }

  const handleSelectElection = (id: number) => {
    clearPosition()
    const params = new URLSearchParams(searchParams)
    params.set("electionId", id.toString())
    setSearchParams(params, { replace: true })
    setBrowseOpen(false)
  }

  const adminButtonClass = "w-full p-4 mb-2 text-black font-extrabold rounded-md shadow-inner shadow-red-50 hover:bg-red-100 bg-red-50 border-2 border-red-50 hover:border-red-500 flex items-start"

  const description = election?.description
    ? <>
      {/* Admins choose whether the quiz is shown; it is always reachable with a direct link */}
      {election.show_toimarivisa && <ToimarivisaCard />}
      <HtmlRenderer htmlContent={election.description} />
    </>
    : <Loading />

  if (!isAdmin) {
    return (
      <div className="
        my-4
        md:col-span-6
        lg:col-span-8
        xl:col-span-10
        2xl:col-span-10">
        {description}
      </div>
    )
  }

  return (
    // Same column layout as the position page: admin tools on the right,
    // rendered above the description on small screens
    <>
      <div className="
        order-2
        md:col-span-2
        lg:col-span-3
        xl:col-span-4
        2xl:col-span-4">
        {election && (
          <button
            onClick={() => setShowAdminEditElectionModal(true)}
            className={adminButtonClass}
          >
            Muokkaa vaaleja
          </button>
        )}
        <button
          onClick={() => setShowAdminCreateElectionModal(true)}
          className={adminButtonClass}
        >
          Luo uudet vaalit
        </button>
        <button
          onClick={handleBrowseClick}
          className={adminButtonClass}
        >
          Selaa vaaleja
        </button>
        {browseOpen && (
          <div className="mb-2 rounded-md border border-red-100 bg-red-50 p-4 shadow-inner">
            {loadingElections ? (
              <Loading />
            ) : availableElections.length === 0 ? (
              <p className="text-sm text-gray-600">Ei muita vaaleja.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {availableElections.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectElection(item.id)}
                    className="flex w-full items-center justify-between rounded-md bg-white px-4 py-2 text-left text-sm font-semibold text-gray-700 hover:bg-red-100"
                  >
                    <span>{item.name}</span>
                    <span className="text-xs uppercase text-gray-500">{item.state}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {election && (
          <button
            onClick={() => openScheduler()}
            className={adminButtonClass}
          >
            Aikatauluta haut
          </button>
        )}
      </div>
      <div className="
        order-1
        my-4
        md:col-span-4
        lg:col-span-5
        xl:col-span-6
        2xl:col-span-6">
        {description}
      </div>
    </>
  )
}
