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
    fuksi?: "sopii" | "varauksin" | "ei"
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
    vastaukset: QuizOption[]
}

// Selected option indices per question id
export type QuizAnswers = Record<string, number[]>

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

export interface ScoredRole {
    role: QuizRole
    score: number
}

// Scoring as described in the quiz plan (suunnitelma.md, section 4)
export function scoreRoles(answers: QuizAnswers, candidates: QuizRole[] = roles): ScoredRole[] {
    const profile: Partial<Record<Theme, number>> = {}
    let firstYear = false
    let littleExperience = false
    let time = 3
    let style: WorkStyle | null = null

    for (const question of questions) {
        for (const index of answers[question.id] ?? []) {
            const option = question.vastaukset[index]
            if (!option) continue
            for (const [theme, points] of Object.entries(option.teemat ?? {}) as [Theme, number][]) {
                profile[theme] = (profile[theme] ?? 0) + points
            }
            if (option.vuosikurssi !== undefined) firstYear = option.vuosikurssi === 1
            if (option.vahanKokemusta) littleExperience = true
            if (option.aika !== undefined) time = option.aika
            if (option.tyyli) style = option.tyyli
        }
    }

    return candidates
        .filter(role => role.mukanaVisassa)
        .map(role => {
            const weights = Object.entries(role.teemat ?? {}) as [Theme, number][]
            const norm = Math.sqrt(weights.reduce((sum, [, w]) => sum + w * w, 0)) || 1
            let score = weights.reduce((sum, [theme, w]) => sum + (profile[theme] ?? 0) * w, 0) / norm

            const roleTime = role.aika ?? 1
            if (roleTime > time) score -= roleTime - time

            if (style && role.tyyli) {
                const distance = Math.abs(styleOrder.indexOf(style) - styleOrder.indexOf(role.tyyli))
                if (distance === 0) score += 1.5
                else if (distance === 1) score += 0.5
            }

            if (firstYear && role.fuksi === "ei") score -= 3
            if (littleExperience && role.kokemus === "vaaditaan") score -= 2

            return { role, score }
        })
        // Ties go to the role that takes less time
        .sort((a, b) => b.score - a.score || (a.role.aika ?? 1) - (b.role.aika ?? 1))
}

export function firstSentence(text: string): string {
    const match = text.match(/^.*?[.!?](\s|$)/)
    return match ? match[0].trim() : text
}
