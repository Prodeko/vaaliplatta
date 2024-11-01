import { useState } from "react"

export default function useConfig() {
    const [BLOB_URL] = useState<string>('https://vaaliplatta.blob.core.windows.net/prod')
    const [API_URL] = useState<string>('/api')
    const [LOGIN_URL] = useState<string>('/oauth2/login')

    return { BLOB_URL, API_URL, LOGIN_URL }
}