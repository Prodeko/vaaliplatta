import axios from "axios";
import useConfig from "./useConfig";

export default function useAuthenticatedRequests() {
    const { API_URL } = useConfig()

    async function get(route: string, params?: Record<string, string>) {
        return axios.get(
            `${API_URL}/${route.replace(/^\/+/, '')}`, // remove possible leading "/"
            { withCredentials: true, params }
        )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async function post(route: string, data: any, config?: any) {

        return axios.post(
            `${API_URL}/${route.replace(/^\/+/, '')}`, // remove possible leading "/"
            data,
            { withCredentials: true, ...config },
        )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async function put(route: string, data: any, config?: any) {

        return axios.put(
            `${API_URL}/${route.replace(/^\/+/, '')}`, // remove possible leading "/"
            data,
            { withCredentials: true, ...config }
        )
    }

    async function upload(file: File) {
        const formData = new FormData()
        formData.append("file", file)

        return axios.post(
            `${API_URL}/upload`,
            formData,
            {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" }
            }
        )
    }

    async function axiosdelete(route: string, params?: Record<string, string>) {
        return axios.delete(
            `${API_URL}/${route.replace(/^\/+/, '')}`,  // remove possible leading "/"
            { withCredentials: true, params }
        )
    }

    return { get, post, put, upload, axiosdelete }
}