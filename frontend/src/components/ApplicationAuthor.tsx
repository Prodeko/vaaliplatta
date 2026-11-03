import { Application } from "../hooks/useAppState"

interface ApplicationAuthorProps {
    application: Application
    className?: string
}

export default function ApplicationAuthor({ application, className = "" }: ApplicationAuthorProps) {
    const { author_name, applicant_name } = application

    if (!author_name || author_name.trim() === applicant_name.trim()) return null

    return <p className={`text-gray-500 ${className}`}>Hakemuksen tekijä: {author_name}</p>
}
