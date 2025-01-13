import { useState } from "react"
const VITE_BLOB_URL = import.meta.env.VITE_BLOB_URL
const VITE_API_URL = import.meta.env.VITE_API_URL
const VITE_LOGIN_URL = import.meta.env.VITE_LOGIN_URL
const VITE_LOGOUT_URL = import.meta.env.VITE_LOGOUT_URL
const VITE_ROOT_URL = import.meta.env.VITE_ROOT_URL

export default function useConfig() {
    const [ROOT_URL] = useState<string>(VITE_ROOT_URL)
    const [BLOB_URL] = useState<string>(VITE_BLOB_URL)
    const [API_URL] = useState<string>(VITE_ROOT_URL + VITE_API_URL)
    const [LOGIN_URL] = useState<string>(VITE_ROOT_URL + VITE_LOGIN_URL)
    const [LOGOUT_URL] = useState<string>(VITE_ROOT_URL + VITE_LOGOUT_URL)

    return { ROOT_URL, BLOB_URL, API_URL, LOGIN_URL, LOGOUT_URL }
}