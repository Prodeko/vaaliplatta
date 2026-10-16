import { useSearchParams } from "react-router-dom"

// The scheduler page is shown with ?view=aikataulut so that it can be linked
// to and the browser back button returns to the election page. A schedule can
// be opened in the editor directly with &aikataulu=<id>.
export default function useSchedulerView() {
    const [searchParams, setSearchParams] = useSearchParams()
    const isSchedulerOpen = searchParams.get("view") === "aikataulut"
    const selectedScheduleId = searchParams.get("aikataulu")

    const openScheduler = (scheduleId?: number) => {
        const params = new URLSearchParams(searchParams)
        params.set("view", "aikataulut")
        if (scheduleId !== undefined) params.set("aikataulu", scheduleId.toString())
        else params.delete("aikataulu")
        setSearchParams(params)
    }

    const closeScheduler = () => {
        const params = new URLSearchParams(searchParams)
        params.delete("view")
        params.delete("aikataulu")
        setSearchParams(params)
    }

    // Called once the linked schedule is open, so that later list reloads don't reselect it
    const clearSelectedScheduleId = () => {
        const params = new URLSearchParams(searchParams)
        params.delete("aikataulu")
        setSearchParams(params, { replace: true })
    }

    return { isSchedulerOpen, selectedScheduleId, openScheduler, closeScheduler, clearSelectedScheduleId }
}
