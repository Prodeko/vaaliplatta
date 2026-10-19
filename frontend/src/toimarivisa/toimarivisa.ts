import data from "./toimarivisa.json"

// The quiz content (roles, questions and result texts) lives in toimarivisa.json.
// Roles are kept separate from the election's positions because positions are
// recreated for every election; they are matched by name with roleKey().

export type Theme = "TAP" | "YHT" | "OPI" | "URA" | "KV" | "VIE" | "LUO" | "TEK" | "RAH" | "PER" | "URH" | "KAY"
export type WorkStyle = "koordinoi" | "tiimi" | "itsenainen"

export interface QuizRole {
    slug: string
    nimi: string
    kategoria: string
    mukanaVisassa: boolean
    teemat?: Partial<Record<Theme, number>>
    aika?: number
    tyyli?: WorkStyle
    // Recommended years of study (1–5)
    minVuosikurssi?: number
    maxVuosikurssi?: number
    kokemus?: "ei" | "hyodyllinen" | "vaaditaan"
    kuvaus: string
}

export interface QuizOption {
    teksti: string
    teemat?: Partial<Record<Theme, number>>
    tyyli?: WorkStyle
    vuosikurssi?: number
    vahanKokemusta?: boolean
    aika?: number
}

export interface QuizQuestion {
    id: string
    teksti: string
    tyyppi: "valinta" | "monivalinta" | "asteikko"
    max?: number
    // Labels shown under the ends of a scale
    asteikonPaat?: { min: string, max: string }
    vastaukset: QuizOption[]
}

// Selected option indices per question id
export type QuizAnswers = Record<string, number[]>

// The scoring debug panel is shown in dev mode, or in a build made with
// VITE_TOIMARIVISA_DEBUG=true
export const debugEnabled = import.meta.env.DEV || import.meta.env.VITE_TOIMARIVISA_DEBUG === "true"

export const roles = data.roolit as QuizRole[]
export const questions = data.kysymykset as QuizQuestion[]

// Normalised name used to match quiz roles to positions. Drops everything but
// letters and digits, so "Proleko?n taittaja", "Prolekon taittaja" and the slug
// "prolekon-taittaja" all give the same key.
export function roleKey(name: string): string {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]/g, "")
}

const styleOrder: WorkStyle[] = ["koordinoi", "tiimi", "itsenainen"]

export interface ScoreParts {
    themes: number
    time: number
    style: number
    year: number
    experience: number
}

export interface ScoredRole {
    role: QuizRole
    score: number
    parts: ScoreParts
}

export type ThemeProfile = Partial<Record<Theme, number>>

interface Respondent {
    profile: ThemeProfile
    year: number | null
    littleExperience: boolean
    time: number
    style: WorkStyle | null
}

// Collects the respondent's theme points and background from the answers
export function readAnswers(answers: QuizAnswers): Respondent {
    const respondent: Respondent = { profile: {}, year: null, littleExperience: false, time: 3, style: null }

    for (const question of questions) {
        for (const index of answers[question.id] ?? []) {
            const option = question.vastaukset[index]
            if (!option) continue
            for (const [theme, points] of Object.entries(option.teemat ?? {}) as [Theme, number][]) {
                respondent.profile[theme] = (respondent.profile[theme] ?? 0) + points
            }
            if (option.vuosikurssi !== undefined) respondent.year = option.vuosikurssi
            if (option.vahanKokemusta) respondent.littleExperience = true
            if (option.aika !== undefined) respondent.time = option.aika
            if (option.tyyli) respondent.style = option.tyyli
        }
    }

    return respondent
}

// Scoring as described in the quiz plan (suunnitelma.md, section 4)
export function scoreRoles(answers: QuizAnswers, candidates: QuizRole[] = roles): ScoredRole[] {
    const { profile, year, littleExperience, time, style } = readAnswers(answers)

    return candidates
        .filter(role => role.mukanaVisassa)
        .map(role => {
            const weights = Object.entries(role.teemat ?? {}) as [Theme, number][]
            const norm = Math.sqrt(weights.reduce((sum, [, w]) => sum + w * w, 0)) || 1
            const roleTime = role.aika ?? 1
            const outsideYears = year !== null
                && (year < (role.minVuosikurssi ?? 1) || year > (role.maxVuosikurssi ?? 5))

            let styleBonus = 0
            if (style && role.tyyli) {
                const distance = Math.abs(styleOrder.indexOf(style) - styleOrder.indexOf(role.tyyli))
                if (distance === 0) styleBonus = 1.5
                else if (distance === 1) styleBonus = 0.5
            }

            const parts: ScoreParts = {
                themes: weights.reduce((sum, [theme, w]) => sum + (profile[theme] ?? 0) * w, 0) / norm,
                // −1 per step the role takes more time than the respondent has,
                // −0.4 per step it takes less
                time: roleTime > time ? -(roleTime - time) : -0.4 * (time - roleTime),
                style: styleBonus,
                year: outsideYears ? -3 : 0,
                experience: littleExperience && role.kokemus === "vaaditaan" ? -2 : 0,
            }
            const score = parts.themes + parts.time + parts.style + parts.year + parts.experience

            return { role, score, parts }
        })
        // Ties go to the role that takes less time
        .sort((a, b) => b.score - a.score || (a.role.aika ?? 1) - (b.role.aika ?? 1))
}

export function firstSentence(text: string): string {
    const match = text.match(/^.*?[.!?](\s|$)/)
    return match ? match[0].trim() : text
}
