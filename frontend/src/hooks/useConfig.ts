import { useState } from "react"
const VITE_BLOB_URL = import.meta.env.VITE_BLOB_URL
const VITE_API_URL = import.meta.env.VITE_API_URL
const VITE_LOGIN_URL = import.meta.env.VITE_LOGIN_URL
const VITE_ROOT_URL = import.meta.env.VITE_ROOT_URL

export default function useConfig() {
    const [BLOB_URL] = useState<string>(VITE_BLOB_URL)
    const [API_URL] = useState<string>(VITE_ROOT_URL + VITE_API_URL)
    const [LOGIN_URL] = useState<string>(VITE_ROOT_URL + VITE_LOGIN_URL)

    return { BLOB_URL, API_URL, LOGIN_URL }
}