import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import useAuthenticatedRequests from "../hooks/useAuthenticatedRequests";
import axios, { AxiosResponse } from "axios";
import { debounce } from "lodash";
import { Application, useAppState } from "../hooks/useAppState";
import ApplicationAuthor from "./ApplicationAuthor";

interface User {
    id: string,
    first_name: string,
    last_name: string,
    email: string,
}

interface SearchUsersResponse {
    rows: User[]
}

const rowClassName = "w-full py-1.5 flex flex-row items-center justify-between gap-4"
const removeButtonClassName = "p-4 min-w-48 shrink-0 text-black font-extrabold rounded-md hover:bg-red-100 bg-red-50 disabled:opacity-50"
const addButtonClassName = "p-4 min-w-48 shrink-0 text-black font-extrabold rounded-md hover:bg-blue-100 bg-blue-50 disabled:opacity-50"

type ApplicationListElemProps = {
    application: Application
    positionName: string
    onChange: () => void
}

function ApplicationListElem({ application, positionName, onChange }: ApplicationListElemProps) {
    const { axiosdelete } = useAuthenticatedRequests()
    const [busy, setBusy] = useState<boolean>(false)

    const removeApplication = () => {
        if (!confirm(`Oletko varma että haluat poistaa hakijan ${application.applicant_name} hakemuksen rooliin ${positionName}? Tätä ei voi perua!`)) return

        setBusy(true)
        axiosdelete(`/admin/application/${application.id}`)
            .then(onChange)
            .catch(err => console.error(err))
            .finally(() => setBusy(false))
    }

    return (
        <div className={rowClassName}>
            <div className="min-w-0">
                <p className="font-bold break-words">{application.applicant_name}</p>
                <ApplicationAuthor application={application} className="text-sm" />
            </div>
            <button className={removeButtonClassName} onClick={removeApplication} disabled={busy}>
                Poista hakemus
            </button>
        </div>
    )
}

type UserListElemProps = {
    user: User
    hasApplied: boolean
    positionId: string
    onChange: () => void
}

function UserListElem({ user, hasApplied, positionId, onChange }: UserListElemProps) {
    const { post } = useAuthenticatedRequests()
    const [busy, setBusy] = useState<boolean>(false)

    const addApplication = () => {
        setBusy(true)
        post("/admin/application", {
            content: `<em>Ilmoittautunut hakijaksi ${new Date().toLocaleDateString("fi")}</em>`,
            applicant_name: `${user.first_name} ${user.last_name}`,
            author_name: `${user.first_name} ${user.last_name}`,
            position_id: positionId,
            applicant_id: user.id.toString()
        }).then(onChange)
            .catch(err => console.error(err))
            .finally(() => setBusy(false))
    }

    return (
        <div className={rowClassName}>
            <div className="min-w-0">
                <p className="font-bold break-words">{user.first_name} {user.last_name}</p>
                <p className="break-words">{`<${user.email}>`}</p>
            </div>
            {hasApplied
                ? <p className="min-w-48 shrink-0 text-center font-semibold text-gray-500">Hakenut jo</p>
                : <button className={addButtonClassName} onClick={addApplication} disabled={busy}>
                    Merkitse hakijaksi
                </button>}
        </div>
    )
}

function AdminEditApplicantsForm() {
    const { get } = useAuthenticatedRequests()
    const { position, refreshPosition } = useAppState()
    const [search, setSearch] = useState<string>("")
    const [newApplicants, setNewApplicants] = useState<User[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const abortRef = useRef<AbortController | null>(null)

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSearch = useCallback(
        debounce((value: string) => {
            abortRef.current?.abort()
            const controller = new AbortController()
            abortRef.current = controller

            setLoading(true)
            get("/users/search", { q: value }, { signal: controller.signal })
                .then((res: AxiosResponse<SearchUsersResponse, unknown>) => setNewApplicants(res.data.rows))
                .catch(err => { if (!axios.isCancel(err)) console.error(err) })
                .finally(() => { if (abortRef.current === controller) setLoading(false) });
        }, 400),
        []
    );

    useEffect(() => () => {
        debouncedSearch.cancel()
        abortRef.current?.abort()
    }, [debouncedSearch])

    const updateSearch = (value: string) => {
        setSearch(value)

        if (value.length >= 3) {
            debouncedSearch(value)
        } else {
            debouncedSearch.cancel()
            abortRef.current?.abort()
            setNewApplicants([])
            setLoading(false)
        }
    }

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        event.preventDefault()
        updateSearch(event.target.value)
    }

    if (!position || position === "loading") return null

    const applicantIds = new Set(position.applications.map(a => String(a.applicant_id).toLowerCase()))

    return <div className="">
        <h1 className="font-extrabold text-xl mb-4">Muokkaa hakijoita</h1>

        <div className="mb-6">
            {position.applications.length === 0
                ? <p className="text-gray-500">Ei hakemuksia.</p>
                : position.applications.map(a =>
                    <ApplicationListElem key={a.id} application={a} positionName={position.name} onChange={refreshPosition} />)}
        </div>

        <h2 className="font-bold text-lg mb-2">Lisää uusi hakija</h2>
        <div className="relative mb-2">
            <label htmlFor="applicant-search" className="sr-only">Etsi kaikista jäsenistä</label>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"
                className="pointer-events-none absolute left-3 top-[13px] h-[18px] w-[18px] text-gray-500">
                <circle cx="8.5" cy="8.5" r="5.5" />
                <path d="M13 13l4 4" />
            </svg>
            <input
                id="applicant-search"
                type="text"
                autoComplete="off"
                spellCheck={false}
                placeholder="Etsi kaikista jäsenistä"
                value={search}
                onChange={handleChange}
                onKeyDown={e => { if (e.key === 'Escape' && search) { e.preventDefault(); updateSearch('') } }}
                className="h-11 w-full rounded-md border border-slate-300 bg-white pl-10 pr-16 text-[15px] font-medium text-gray-900 placeholder:text-gray-500 transition focus:border-blue-500 focus:outline-none focus:ring-[3px] focus:ring-blue-500/25"
            />
            {loading && (
                <div aria-hidden="true" className="absolute right-11 top-3 h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-blue-500" />
            )}
            {search && (
                <button
                    onClick={() => updateSearch('')}
                    aria-label="Tyhjennä haku"
                    title="Tyhjennä (Esc)"
                    className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="h-4 w-4 text-gray-600">
                        <path d="M5 5l10 10M15 5L5 15" />
                    </svg>
                </button>
            )}
        </div>
        <div>
            {newApplicants.map(u =>
                <UserListElem
                    key={u.id}
                    user={u}
                    hasApplied={applicantIds.has(String(u.id).toLowerCase())}
                    positionId={position.id.toString()}
                    onChange={refreshPosition}
                />)}
        </div>
    </div>
}

export default AdminEditApplicantsForm;
