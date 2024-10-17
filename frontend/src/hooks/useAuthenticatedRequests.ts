import axios from "axios";
import { useAuth } from "./useAuth";
import { useAppState } from "./useAppState";

export default function useAuthenticatedRequests() {
    const { token } = useAuth();
    const { API_URL } = useAppState();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async function post(route: string, data: any, config?: any) {

        // Merge caller supplied config and headers with Authorization header here
        let cfg = { headers: { Authorization: `Bearer ${token}` } }
        if (config) cfg = { ...config, ...cfg }
        if (config && config.headers) cfg.headers = { ...cfg.headers, ...config.headers }

        return axios.post(
            `${API_URL}/${route.replace(/^\/+/, '')}`, // remove possible leading "/"
            data,
            cfg,
        )
    }

    async function upload(file: File) {
        const formData = new FormData()
        formData.append("file", file)

        return axios.post(
            `${API_URL}/upload`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            }
        )
    }

    async function axiosdelete(route: string) {
        return axios.delete(
            `${API_URL}/${route.replace(/^\/+/, '')}`,  // remove possible leading "/"
            { headers: { Authorization: `Bearer ${token}` } }
        )
    }

    return { post, upload, axiosdelete }
}