import { useEffect, useMemo, useRef, useState } from "react"
import { Position, useAppState } from "../hooks/useAppState"
import useAuthenticatedRequests from "../hooks/useAuthenticatedRequests"
import useToimarivisaView from "../hooks/useToimarivisaView"
import { QuizAnswers, QuizRole, firstSentence, questions, roleKey, roles, scoreRoles } from "../toimarivisa/toimarivisa"

type Screen = "start" | "question" | "result"

interface QuizState {
    screen: Screen
    index: number
    answers: QuizAnswers
}

const initialState: QuizState = { screen: "start", index: 0, answers: {} }

const categoryLabels: Record<string, string> = {
    hallitus: "Hallitus",
    vastuutoimarit: "Vastuutoimari",
    toimarit: "Toimari",
}

// An unfinished quiz survives a page reload, and the result stays when the
// user opens a role and comes back
function storageKey(electionId: number) {
    return `toimarivisa-${electionId}`
}

function loadState(electionId: number): QuizState {
    try {
        const stored = sessionStorage.getItem(storageKey(electionId))
        if (stored) return JSON.parse(stored) as QuizState
    } catch {
        // ignore unavailable or broken storage
    }
    return initialState
}

const primaryButton = "inline-flex items-center justify-center gap-2 min-h-12 px-7 py-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-extrabold disabled:bg-slate-300 disabled:text-slate-600 disabled:cursor-not-allowed"
const softButton = "min-h-11 px-5 py-3 rounded-md bg-blue-50 hover:bg-blue-100 text-gray-900 font-extrabold"

const chevronRight = (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]" aria-hidden="true">
        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
)

export default function Toimarivisa() {
    const { election, getPosition } = useAppState()
    const { closeToimarivisa } = useToimarivisaView()
    const { post } = useAuthenticatedRequests()
    const [state, setState] = useState<QuizState>(initialState)
    const [loadedFor, setLoadedFor] = useState<number | null>(null)
    const headingRef = useRef<HTMLHeadingElement>(null)
    const advanceTimer = useRef<number>()
    const moved = useRef(false)

    // Restore the stored quiz once the election is known
    useEffect(() => {
        if (election && loadedFor !== election.id) {
            setState(loadState(election.id))
            setLoadedFor(election.id)
        }
    }, [election, loadedFor])

    useEffect(() => {
        if (loadedFor === null) return
        try {
            sessionStorage.setItem(storageKey(loadedFor), JSON.stringify(state))
        } catch {
            // ignore unavailable storage
        }
    }, [state, loadedFor])

    // Move focus to the new heading when the question changes, so that screen
    // readers and keyboard users follow along. Not on the first render.
    useEffect(() => {
        const heading = headingRef.current
        if (!moved.current || !heading) return
        heading.focus({ preventScroll: true })
        if (heading.getBoundingClientRect().top < 0) heading.scrollIntoView({ block: "start", behavior: "smooth" })
    }, [state.screen, state.index])

    useEffect(() => () => window.clearTimeout(advanceTimer.current), [])

    // Only roles that exist in this election are suggested
    const positionsByKey = useMemo(() => {
        const map = new Map<string, Position>()
        election?.positions?.forEach(p => map.set(roleKey(p.name), p))
        return map
    }, [election])

    const wildCard = useMemo(
        () => election?.positions?.find(p => roleKey(p.name).startsWith("wildcard")),
        [election]
    )

    const results = useMemo(() => {
        if (state.screen !== "result") return []
        const available = roles.filter(r => positionsByKey.has(roleKey(r.nimi)))
        return scoreRoles(state.answers, available).slice(0, 3)
    }, [state.screen, state.answers, positionsByKey])

    const update = (patch: Partial<QuizState>) => {
        moved.current = true
        setState(current => ({ ...current, ...patch }))
    }

    const showResult = (answers: QuizAnswers) => {
        update({ screen: "result", answers })
        if (!election) return
        const available = roles.filter(r => positionsByKey.has(roleKey(r.nimi)))
        const top = scoreRoles(answers, available).slice(0, 3).map(r => r.role.slug)
        // Stored anonymously for statistics: no user, cookie or IP is saved
        post("/toimarivisa/result", { election_id: election.id, answers, top_results: top })
            .catch(error => console.error(error))
    }

    const goNext = (answers: QuizAnswers) => {
        window.clearTimeout(advanceTimer.current)
        if (state.index < questions.length - 1) update({ index: state.index + 1, answers })
        else showResult(answers)
    }

    const goPrevious = () => {
        window.clearTimeout(advanceTimer.current)
        if (state.index > 0) update({ index: state.index - 1 })
        else update({ screen: "start" })
    }

    const restart = () => {
        window.clearTimeout(advanceTimer.current)
        update({ ...initialState })
    }

    const openRole = (role: QuizRole) => {
        const position = positionsByKey.get(roleKey(role.nimi))
        if (position) getPosition(position.id.toString())
    }

    let content: JSX.Element

    if (state.screen === "start") {
        content = (
            <section className="flex flex-col gap-6 pt-2">
                <h2 ref={headingRef} tabIndex={-1} className="text-3xl md:text-4xl font-extrabold leading-tight focus:outline-none">
                    Mikä toimarirooli sopisi sinulle?
                </h2>
                <p className="text-lg leading-relaxed text-gray-700">
                    Vastaa kymmeneen kysymykseen, niin ehdotamme sinulle kolmea pestiä tämän vuoden vaalien rooleista. Mukana ovat hallitus, vastuutoimarit ja toimarit.
                </p>
                <div>
                    <button className={`${primaryButton} text-lg px-8 py-4`} onClick={() => update({ screen: "question", index: 0, answers: {} })}>
                        Aloita visa
                    </button>
                </div>
            </section>
        )
    } else if (state.screen === "question") {
        const question = questions[state.index]
        const picked = state.answers[question.id] ?? []
        const isMulti = question.tyyppi === "monivalinta"
        const isScale = question.tyyppi === "asteikko"
        const max = question.max ?? 1
        const isLast = state.index === questions.length - 1
        const showNext = isMulti || picked.length > 0

        const pick = (optionIndex: number) => {
            if (isMulti) {
                const selected = picked.includes(optionIndex)
                if (!selected && picked.length >= max) return
                const next = selected ? picked.filter(i => i !== optionIndex) : [...picked, optionIndex]
                update({ answers: { ...state.answers, [question.id]: next } })
            } else {
                const answers = { ...state.answers, [question.id]: [optionIndex] }
                update({ answers })
                // Show the selection briefly before moving on
                window.clearTimeout(advanceTimer.current)
                advanceTimer.current = window.setTimeout(() => goNext(answers), 220)
            }
        }

        content = (
            <section className="flex flex-col gap-3">
                <div className="flex flex-col items-center gap-1.5">
                    <div
                        role="progressbar"
                        aria-label="Edistyminen"
                        aria-valuemin={1}
                        aria-valuemax={questions.length}
                        aria-valuenow={state.index + 1}
                        className="flex w-full gap-1"
                    >
                        {questions.map((q, k) => {
                            const answered = k < state.index || (state.answers[q.id] ?? []).length > 0
                            const color = k === state.index ? "bg-blue-600" : answered ? "bg-blue-300" : "bg-gray-200"
                            return <span key={q.id} className={`h-2 flex-1 rounded-full ${color}`} />
                        })}
                    </div>
                    <p className="text-sm font-bold text-gray-600">{state.index + 1}/{questions.length}</p>
                </div>

                <h2 ref={headingRef} tabIndex={-1} className="mt-1 text-2xl md:text-3xl font-extrabold leading-tight focus:outline-none">
                    {question.teksti}
                </h2>
                {isMulti && (
                    <p className="-mt-1 text-gray-700">
                        {max === 2 ? "Valitse yksi tai kaksi." : `Valitse enintään ${max}.`}{" "}
                        <span className="font-bold text-blue-700">{picked.length}/{max} valittu</span>
                    </p>
                )}

                {isScale ? (
                    <div className="mt-1 grid grid-cols-5 gap-2">
                        {question.vastaukset.map((option, i) => {
                            const selected = picked.includes(i)
                            return (
                                <button
                                    key={option.teksti}
                                    onClick={() => pick(i)}
                                    aria-pressed={selected}
                                    className={`min-h-[60px] rounded-md text-3xl font-extrabold transition ${selected ? "bg-blue-50 ring-2 ring-blue-600" : "bg-white ring-1 ring-gray-300 hover:ring-2 hover:ring-blue-600"}`}
                                >
                                    {option.teksti}
                                </button>
                            )
                        })}
                    </div>
                ) : (
                    <div className="mt-1 flex flex-col gap-2">
                        {question.vastaukset.map((option, i) => {
                            const selected = picked.includes(i)
                            const disabled = isMulti && !selected && picked.length >= max
                            const colors = selected
                                ? "bg-blue-50 ring-2 ring-blue-600"
                                : disabled
                                    ? "bg-slate-50 text-slate-500 ring-1 ring-gray-200 cursor-not-allowed"
                                    : "bg-white ring-1 ring-gray-300 hover:ring-2 hover:ring-blue-600"
                            return (
                                <button
                                    key={option.teksti}
                                    onClick={() => pick(i)}
                                    aria-pressed={selected}
                                    disabled={disabled}
                                    className={`flex min-h-12 w-full items-center gap-3 rounded-md px-4 py-3 text-left text-lg font-semibold transition ${colors}`}
                                >
                                    {isMulti && (
                                        <span
                                            aria-hidden="true"
                                            className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded ${selected ? "bg-blue-600 text-white" : "bg-white text-transparent ring-2 ring-inset ring-slate-400"}`}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </span>
                                    )}
                                    <span>{option.teksti}</span>
                                </button>
                            )
                        })}
                    </div>
                )}

                <div className="mt-1 flex items-center justify-between gap-4">
                    <button
                        onClick={goPrevious}
                        className="-ml-3 flex min-h-11 items-center gap-1.5 rounded-md px-3 py-2.5 font-bold text-gray-700 hover:bg-slate-100"
                    >
                        <svg viewBox="0 0 20 20" fill="currentColor" className="h-[18px] w-[18px]" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Edellinen
                    </button>
                    {showNext && (
                        <button className={`${primaryButton} text-lg`} onClick={() => goNext(state.answers)} disabled={picked.length === 0}>
                            {isLast ? "Näytä tulos" : "Seuraava"}
                        </button>
                    )}
                </div>
            </section>
        )
    } else if (results.length === 0) {
        content = (
            <section className="flex flex-col gap-6">
                <h2 ref={headingRef} tabIndex={-1} className="text-3xl font-extrabold focus:outline-none">Tulosta ei voitu näyttää</h2>
                <p className="text-lg text-gray-700">
                    {election ? "Näiden vaalien rooleista ei löytynyt visaan kuuluvia rooleja." : "Ladataan vaaleja…"}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                    <button className={softButton} onClick={restart}>Tee visa uudelleen</button>
                    <button className="px-2 py-3 font-bold text-blue-700 underline hover:text-blue-900" onClick={closeToimarivisa}>Takaisin vaalien etusivulle</button>
                </div>
            </section>
        )
    } else {
        const [top, ...alternatives] = results
        content = (
            <section className="flex flex-col gap-8">
                <div className="flex flex-col gap-4">
                    <p className="text-sm font-extrabold uppercase tracking-wider text-blue-700">Sinulle sopisi parhaiten</p>
                    <h2 ref={headingRef} tabIndex={-1} className="text-4xl md:text-5xl font-extrabold leading-tight focus:outline-none">
                        {top.role.nimi}
                    </h2>
                    <p className="text-lg leading-relaxed text-gray-800">{top.role.kuvaus}</p>
                    <div>
                        <button className={`${primaryButton} text-lg`} onClick={() => openRole(top.role)}>
                            Hae rooliin
                            {chevronRight}
                        </button>
                    </div>
                </div>

                {alternatives.length > 0 && (
                    <div className="flex flex-col gap-3">
                        <h3 className="text-2xl font-extrabold">Myös nämä voisivat sopia</h3>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {alternatives.map(({ role }) => (
                                <button
                                    key={role.slug}
                                    onClick={() => openRole(role)}
                                    className="flex flex-col gap-2 rounded-md border border-gray-200 p-5 text-left hover:ring-2 hover:ring-blue-600"
                                >
                                    <span className="text-sm font-bold text-gray-600">{categoryLabels[role.kategoria] ?? role.kategoria}</span>
                                    <span className="text-xl font-extrabold leading-tight">{role.nimi}</span>
                                    <span className="leading-relaxed text-gray-700">{firstSentence(role.kuvaus)}</span>
                                    <span className="mt-auto font-bold text-blue-700">Katso rooli</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {wildCard && (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border-2 border-dashed border-blue-300 p-5">
                        <div className="flex-[1_1_320px]">
                            <p className="mb-1 text-lg font-extrabold">Eikö mikään osunut?</p>
                            <p className="leading-normal text-gray-700">Keksi oma pesti ja ehdota sitä Wild Card -roolina.</p>
                        </div>
                        <button className={softButton} onClick={() => getPosition(wildCard.id.toString())}>
                            Ehdota omaa roolia
                        </button>
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-3 border-t border-gray-200 pt-6">
                    <button className={softButton} onClick={restart}>Tee visa uudelleen</button>
                    <button className="px-2 py-3 font-bold text-blue-700 underline hover:text-blue-900" onClick={closeToimarivisa}>
                        Takaisin vaalien etusivulle
                    </button>
                </div>
            </section>
        )
    }

    return (
        <div className="mx-auto max-w-2xl px-1 pb-16 pt-6 md:pt-12">
            {content}
        </div>
    )
}
