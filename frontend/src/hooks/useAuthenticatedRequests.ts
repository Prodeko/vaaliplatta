import axios from "axios";
import { useAuth } from "./useAuth";
import useConfig from "./useConfig";

export default function useAuthenticatedRequests() {
    const { token } = useAuth();
    const { API_URL } = useConfig()

    async function get(route: string, params?: Record<string, string>) {
        return axios.get(
            `${API_URL}/${route.replace(/^\/+/, '')}`, // remove possible leading "/"
            { headers: token ? { Authorization: `Bearer ${token}` } : {}, params }
        )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async function post(route: string, data: any, config?: any) {

        // Merge caller supplied config and headers with Authorization header here
        let cfg = { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        if (config) cfg = { ...config, ...cfg }
        if (config && config.headers) cfg.headers = { ...cfg.headers, ...config.headers }

        return axios.post(
            `${API_URL}/${route.replace(/^\/+/, '')}`, // remove possible leading "/"
            data,
            cfg,
        )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async function put(route: string, data: any, config?: any) {

        // Merge caller supplied config and headers with Authorization header here
        let cfg = { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        if (config) cfg = { ...config, ...cfg }
        if (config && config.headers) cfg.headers = { ...cfg.headers, ...config.headers }

        return axios.put(
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
                headers: token
                    ? {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data"
                    }
                    : { "Content-Type": "multipart/form-data" }
            }
        )
    }

    async function axiosdelete(route: string, params?: Record<string, string>) {
        return axios.delete(
            `${API_URL}/${route.replace(/^\/+/, '')}`,  // remove possible leading "/"
            { headers: token ? { Authorization: `Bearer ${token}` } : {}, params }
        )
    }

    return { get, post, put, upload, axiosdelete }
}