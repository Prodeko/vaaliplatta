import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useAppState } from "../hooks/useAppState"
import type { Election as ElectionType } from "../hooks/useAppState"
import useAuthenticatedRequests from "../hooks/useAuthenticatedRequests"
import HtmlRenderer from "./HtmlRenderer"
import Loading from "./Loading"
import { useAuth } from "../hooks/useAuth"

type ElectionSummary = Pick<ElectionType, "id" | "name" | "state">

export default function Election() {
  const {
    election,
    setShowAdminEditElectionModal,
    setShowAdminCreateElectionModal,
    clearPosition,
  } = useAppState()
  const { session } = useAuth()
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

  return (
    <div className="my-4">
      {isAdmin && (
        <div className="flex flex-wrap gap-2 mb-4 min-w-full">
          {election && (
            <button
              onClick={() => setShowAdminEditElectionModal(true)}
              className="grow p-4 text-black font-extrabold rounded-md shadow-inner shadow-red-50 hover:bg-red-100 bg-red-50 border-2 border-red-50 hover:border-red-500 flex items-start"
            >
              Muokkaa vaaleja
            </button>
          )}
          <button
            onClick={() => setShowAdminCreateElectionModal(true)}
            className="grow p-4 text-black font-extrabold rounded-md shadow-inner shadow-red-50 hover:bg-red-100 bg-red-50 border-2 border-red-50 hover:border-red-500 flex items-start"
          >
            Luo uudet vaalit
          </button>
          <button
            onClick={handleBrowseClick}
            className="grow p-4 text-black font-extrabold rounded-md shadow-inner shadow-red-50 hover:bg-red-100 bg-red-50 border-2 border-red-50 hover:border-red-500 flex items-start"
          >
            Selaa vaaleja
          </button>
        </div>
      )}
      {isAdmin && browseOpen && (
        <div className="mb-4 rounded-md border border-red-100 bg-red-50 p-4 shadow-inner">
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
      {election?.description ? <HtmlRenderer htmlContent={election?.description} /> : <Loading />}
    </div>
  )
}
