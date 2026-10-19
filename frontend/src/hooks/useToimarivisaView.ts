import { useSearchParams } from "react-router-dom"

// The toimarivisa is shown with ?view=toimarivisa, like the scheduler page, so
// that the electionId is kept and the quiz can be linked to.
export default function useToimarivisaView() {
    const [searchParams, setSearchParams] = useSearchParams()
    const isToimarivisaOpen = searchParams.get("view") === "toimarivisa"

    const openToimarivisa = () => {
        const params = new URLSearchParams(searchParams)
        params.set("view", "toimarivisa")
        setSearchParams(params)
    }

    const closeToimarivisa = () => {
        const params = new URLSearchParams(searchParams)
        params.delete("view")
        setSearchParams(params)
    }

    return { isToimarivisaOpen, openToimarivisa, closeToimarivisa }
}
