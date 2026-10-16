import { useCallback, useEffect, useState } from "react"
import { groupBy } from "lodash"
import { Schedule, State, useAppState } from "../hooks/useAppState"
import useAuthenticatedRequests from "../hooks/useAuthenticatedRequests"
import useSchedulerView from "../hooks/useSchedulerView"
import { formatDateTime, toDateTimeLocalValue } from "../utils/formatDateTime"
import Loading from "./Loading"

interface ScheduleDraft {
    id: number | null
    name: string
    opens_at: string // datetime-local value
    closes_at: string // datetime-local value
    position_ids: number[]
}

const emptyDraft: ScheduleDraft = { id: null, name: "", opens_at: "", closes_at: "", position_ids: [] }

const positionCategories = [
    { key: "hallitus", label: "HALLITUS" },
    { key: "vastuutoimarit", label: "VASTUUTOIMARIT" },
    { key: "toimarit", label: "TOIMARIT" },
]

const roleCount = (n: number) => n === 1 ? "1 rooli" : `${n} roolia`

function scheduleStatus(schedule: Schedule) {
    const now = Date.now()
    if (now < Date.parse(schedule.opens_at)) return "Tuleva"
    if (now < Date.parse(schedule.closes_at)) return "Käynnissä"
    return "Päättynyt"
}

const inputClass = "block w-full border-gray-300 rounded-md bg-blue-50 hover:bg-blue-100 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
const labelClass = "text-sm font-medium text-gray-700"
const adminButtonClass = "w-full p-4 mb-2 text-black font-extrabold rounded-md shadow-inner shadow-red-50 hover:bg-red-100 bg-red-50 border-2 border-red-50 hover:border-red-500 flex items-start"

export default function SchedulerView() {
    const { election, getElection } = useAppState()
    const { get, post, put, axiosdelete } = useAuthenticatedRequests()
    const { selectedScheduleId, clearSelectedScheduleId } = useSchedulerView()
    const [schedules, setSchedules] = useState<Schedule[] | null>(null)
    const [draft, setDraft] = useState<ScheduleDraft | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)

    const electionId = election?.id

    const loadSchedules = useCallback(async () => {
        if (!electionId) return
        const response = await get("/schedule", { election_id: electionId.toString() })
        setSchedules(response.data)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [electionId])

    useEffect(() => {
        setDraft(null)
        setSchedules(null)
        loadSchedules().catch(err => console.error(err))
    }, [loadSchedules])

    // Open the schedule linked from a position page once the list has loaded
    useEffect(() => {
        const linked = schedules?.find(s => s.id.toString() === selectedScheduleId)
        if (!linked) return
        editSchedule(linked)
        clearSelectedScheduleId()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [schedules, selectedScheduleId])

    const editSchedule = (schedule: Schedule) => {
        setError(null)
        setDraft({
            id: schedule.id,
            name: schedule.name,
            opens_at: toDateTimeLocalValue(schedule.opens_at),
            closes_at: toDateTimeLocalValue(schedule.closes_at),
            position_ids: schedule.position_ids,
        })
    }

    const newSchedule = () => {
        setError(null)
        setDraft(emptyDraft)
    }

    const updateDraft = (changes: Partial<ScheduleDraft>) => {
        setError(null)
        setDraft(current => current && { ...current, ...changes })
    }

    const togglePosition = (positionId: number) => {
        if (!draft) return
        const position_ids = draft.position_ids.includes(positionId)
            ? draft.position_ids.filter(id => id !== positionId)
            : [...draft.position_ids, positionId]
        updateDraft({ position_ids })
    }

    const toggleCategory = (positionIds: number[]) => {
        if (!draft) return
        const allSelected = positionIds.every(id => draft.position_ids.includes(id))
        const position_ids = allSelected
            ? draft.position_ids.filter(id => !positionIds.includes(id))
            : [...new Set([...draft.position_ids, ...positionIds])]
        updateDraft({ position_ids })
    }

    const validate = (d: ScheduleDraft): string | null => {
        if (!d.name.trim()) return "Anna aikataululle nimi."
        if (!d.opens_at || !d.closes_at) return "Valitse aukeamis- ja sulkeutumisaika."
        if (new Date(d.closes_at) <= new Date(d.opens_at)) return "Sulkeutumisajan pitää olla aukeamisen jälkeen."
        if (d.position_ids.length === 0) return "Valitse vähintään yksi rooli."
        return null
    }

    const refreshAfterChange = async () => {
        await loadSchedules()
        // Position states depend on schedules, so refresh the nav and position data too
        if (electionId) await getElection(electionId.toString())
    }

    const saveSchedule = async () => {
        if (!draft || !electionId) return
        const validationError = validate(draft)
        if (validationError) return setError(validationError)

        const body = {
            name: draft.name.trim(),
            opens_at: new Date(draft.opens_at).toISOString(),
            closes_at: new Date(draft.closes_at).toISOString(),
            position_ids: draft.position_ids,
        }

        try {
            setSaving(true)
            const response = draft.id === null
                ? await post("/schedule", { ...body, election_id: electionId })
                : await put(`/schedule/${draft.id}`, body)
            await refreshAfterChange()
            editSchedule(response.data)
        } catch (err) {
            console.error(err)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setError((err as any)?.response?.data?.error ?? "Tallentaminen epäonnistui.")
        } finally {
            setSaving(false)
        }
    }

    const deleteSchedule = async () => {
        if (!draft) return
        if (draft.id === null) return setDraft(null)
        if (!window.confirm(`Poistetaanko aikataulu "${draft.name}"?`)) return

        try {
            setSaving(true)
            await axiosdelete(`/schedule/${draft.id}`)
            setDraft(null)
            await refreshAfterChange()
        } catch (err) {
            console.error(err)
            setError("Poistaminen epäonnistui.")
        } finally {
            setSaving(false)
        }
    }

    const positionsByCategory = groupBy(election?.positions, p => p.category)

    const editor = draft === null
        ? (
            <div className="my-4 p-8 rounded-md border-2 border-dashed border-gray-200 text-center text-gray-500">
                Valitse aikataulu listasta tai luo uusi.
            </div>
        )
        : (
            <div className="my-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-extrabold">
                        {draft.id === null ? "Uusi aikataulu" : "Muokkaa aikataulua"}
                    </h2>
                    <button
                        onClick={() => setDraft(null)}
                        aria-label="Sulje"
                        className="w-10 h-10 rounded-full hover:bg-gray-100 text-xl text-gray-600"
                    >
                        ×
                    </button>
                </div>

                <div className="flex flex-col gap-2 my-4">
                    <label htmlFor="schedule-name" className={labelClass}>Nimi</label>
                    <input
                        id="schedule-name"
                        className={inputClass}
                        placeholder="Hallitus, 1. kierros"
                        value={draft.name}
                        onChange={e => updateDraft({ name: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="schedule-opens" className={labelClass}>Haku aukeaa</label>
                        <input
                            id="schedule-opens"
                            type="datetime-local"
                            className={inputClass}
                            value={draft.opens_at}
                            onChange={e => updateDraft({ opens_at: e.target.value })}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="schedule-closes" className={labelClass}>Haku sulkeutuu</label>
                        <input
                            id="schedule-closes"
                            type="datetime-local"
                            className={inputClass}
                            value={draft.closes_at}
                            onChange={e => updateDraft({ closes_at: e.target.value })}
                        />
                    </div>
                </div>

                <p className={labelClass}>Roolit ({roleCount(draft.position_ids.length)})</p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 my-2">
                    {positionCategories.map(category => {
                        const positions = (positionsByCategory[category.key] ?? [])
                            .sort((a, b) => a.name.localeCompare(b.name))
                        if (positions.length === 0) return null
                        const positionIds = positions.map(p => p.id)
                        const allSelected = positionIds.every(id => draft.position_ids.includes(id))
                        return (
                            <div key={category.key} className="mb-4">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-xs font-extrabold text-gray-500">{category.label}</p>
                                    <button
                                        onClick={() => toggleCategory(positionIds)}
                                        className="text-xs font-bold text-blue-600 hover:underline"
                                    >
                                        {allSelected ? "Poista valinnat" : "Valitse kaikki"}
                                    </button>
                                </div>
                                {positions.map(position => (
                                    <label key={position.id} className="flex items-center gap-2 py-1 text-sm text-gray-700 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={draft.position_ids.includes(position.id)}
                                            onChange={() => togglePosition(position.id)}
                                        />
                                        <span>{position.name}</span>
                                        {position.state === State.DRAFT && (
                                            <span className="text-xs text-amber-700">luonnos, ei aukea</span>
                                        )}
                                        {position.state === State.ARCHIVED && (
                                            <span className="text-xs text-gray-500">arkistoitu</span>
                                        )}
                                    </label>
                                ))}
                            </div>
                        )
                    })}
                </div>

                {error && <p className="my-2 text-sm text-red-600">{error}</p>}

                <div className="flex justify-between gap-2 mt-4">
                    <button
                        onClick={deleteSchedule}
                        disabled={saving}
                        className="bg-red-50 hover:bg-red-100 text-red-700 rounded-md py-2 px-4 font-bold"
                    >
                        {draft.id === null ? "Peruuta" : "Poista"}
                    </button>
                    <button
                        onClick={saveSchedule}
                        disabled={saving}
                        className="bg-green-50 hover:bg-green-100 rounded-md py-2 px-4 font-bold"
                    >
                        {saving ? "Tallennetaan…" : "Tallenna"}
                    </button>
                </div>
            </div>
        )

    return (
        // Same column layout as the election page: the list is in the right
        // column and rendered above the editor on small screens
        <>
            <div className="
                order-1
                md:order-2
                md:col-span-2
                lg:col-span-3
                xl:col-span-4
                2xl:col-span-4">
                <button onClick={newSchedule} className={adminButtonClass}>
                    Uusi aikataulu
                </button>
                {schedules === null
                    ? <Loading />
                    : schedules.length === 0
                        ? <p className="p-4 text-sm text-gray-500">Ei vielä aikatauluja.</p>
                        : schedules.map(schedule => {
                            const selected = draft?.id === schedule.id
                            return (
                                <button
                                    key={schedule.id}
                                    onClick={() => editSchedule(schedule)}
                                    className={`w-full text-left p-4 mb-2 rounded-md border-2 ${selected
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-gray-100 hover:border-blue-300 hover:bg-blue-50"}`}
                                >
                                    <p className="font-extrabold text-black">{schedule.name}</p>
                                    <p className="mt-1 text-sm text-gray-600">
                                        {formatDateTime(schedule.opens_at)} → {formatDateTime(schedule.closes_at)}
                                    </p>
                                    <div className="mt-2 flex justify-between text-sm text-gray-500">
                                        <span>{roleCount(schedule.position_ids.length)}</span>
                                        <span>{scheduleStatus(schedule)}</span>
                                    </div>
                                </button>
                            )
                        })}
            </div>
            <div className="
                order-2
                md:order-1
                md:col-span-4
                lg:col-span-5
                xl:col-span-6
                2xl:col-span-6">
                {editor}
            </div>
        </>
    )
}
