import { useState } from "react"
import { QuizAnswers, Theme, readAnswers, roleKey, roles, scoreRoles } from "../toimarivisa/toimarivisa"

// Debug panel for tuning the scoring: the respondent's theme points and every
// role's score. Only shown when debugEnabled is set.

interface Props {
    answers: QuizAnswers
    electionRoleKeys: Set<string>
}

const format = (value: number) => value === 0 ? "" : (Math.round(value * 100) / 100).toString()

export default function ToimarivisaDebug({ answers, electionRoleKeys }: Props) {
    const [open, setOpen] = useState(false)

    const respondent = readAnswers(answers)
    const scored = scoreRoles(answers, roles)
    const profile = (Object.entries(respondent.profile) as [Theme, number][]).sort((a, b) => b[1] - a[1])

    let rank = 0

    return (
        <div className="mt-12 border-t border-dashed border-gray-300 pt-4 text-sm">
            <button
                onClick={() => setOpen(!open)}
                className="rounded-md bg-gray-100 px-3 py-2 font-mono text-gray-700 hover:bg-gray-200"
                aria-expanded={open}
            >
                {open ? "Piilota debug" : "Debug: pisteet ja järjestys"}
            </button>
            {open && (
                <div className="mt-4 flex flex-col gap-4 font-mono text-gray-800">
                    <div>
                        <p className="font-bold">Vastaajan teemapisteet</p>
                        <p>{profile.length ? profile.map(([t, p]) => `${t} ${p}`).join(" · ") : "ei vielä pisteitä"}</p>
                        <p className="mt-1">
                            aika {respondent.time} · tyyli {respondent.style ?? "–"} · vuosikurssi {respondent.year ?? "–"} · vähän kokemusta {respondent.littleExperience ? "kyllä" : "ei"}
                        </p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full whitespace-nowrap text-left">
                            <thead>
                                <tr className="border-b border-gray-300">
                                    <th className="py-1 pr-3">#</th>
                                    <th className="py-1 pr-3">Rooli</th>
                                    <th className="py-1 pr-3 text-right">Yht.</th>
                                    <th className="py-1 pr-3 text-right">Teemat</th>
                                    <th className="py-1 pr-3 text-right">Aika</th>
                                    <th className="py-1 pr-3 text-right">Tyyli</th>
                                    <th className="py-1 pr-3 text-right">Vsk</th>
                                    <th className="py-1 pr-3 text-right">Kokemus</th>
                                </tr>
                            </thead>
                            <tbody>
                                {scored.map(({ role, score, parts }) => {
                                    // Roles missing from the election are never suggested, so they get no rank
                                    const inElection = electionRoleKeys.has(roleKey(role.nimi))
                                    if (inElection) rank += 1
                                    return (
                                        <tr key={role.slug} className={`border-b border-gray-100 ${inElection ? "" : "text-gray-400"} ${inElection && rank <= 3 ? "bg-blue-50 font-bold" : ""}`}>
                                            <td className="py-1 pr-3">{inElection ? rank : "–"}</td>
                                            <td className="py-1 pr-3">{role.nimi}{inElection ? "" : " (ei vaaleissa)"} <span className="text-gray-400">vsk {role.minVuosikurssi}–{role.maxVuosikurssi}</span></td>
                                            <td className="py-1 pr-3 text-right">{score.toFixed(2)}</td>
                                            <td className="py-1 pr-3 text-right">{format(parts.themes)}</td>
                                            <td className="py-1 pr-3 text-right">{format(parts.time)}</td>
                                            <td className="py-1 pr-3 text-right">{format(parts.style)}</td>
                                            <td className="py-1 pr-3 text-right">{format(parts.year)}</td>
                                            <td className="py-1 pr-3 text-right">{format(parts.experience)}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
