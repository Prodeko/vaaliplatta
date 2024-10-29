import { ChangeEvent, useCallback, useState } from "react";
import useAuthenticatedRequests from "../hooks/useAuthenticatedRequests";
import { AxiosResponse } from "axios";
import { throttle } from "lodash";
import Loading from "./Loading";
import { useAppState } from "../hooks/useAppState";

interface User {
    id: number,
    first_name: string,
    last_name: string,
    email: string,
}

interface SearchUsersResponse {
    rows: User[]
}

type UserListElemProps = {
    user: User
}

function UserListElem({ user }: UserListElemProps) {
    const { post, axiosdelete } = useAuthenticatedRequests()
    const { position } = useAppState()

    if (!position || position === "loading") return null

    const hasApplied = position.applications.map(a => a.applicant_id).includes(user.id.toString())

    const addApplication = () => {
        post("/admin/application", {
            content: `<em>Ilmoittautunut hakijaksi ${new Date().toLocaleDateString("fi")}</em>`,
            applicant_name: `${user.first_name} ${user.last_name}`,
            position_id: position.id.toString(),
            applicant_id: user.id.toString()
        })
    }

    const removeApplication = () => {
        axiosdelete("/admin/application", { applicant_id: user.id.toString(), position_id: position.id.toString() })
    }

    return (
        <div className="w-full px-4 py-2 flex flex-row justify-between border-solid border-b-2 border-x-2 border-gray-100">
            <div>
                <p className="font-bold">{user.first_name} {user.last_name}</p>
                <p>{`<${user.email}>`}</p>
            </div>
            {hasApplied
                ? <button className="p-4 min-w-48 text-black font-extrabold rounded-md hover:bg-red-100 bg-red-50"
                    onClick={removeApplication}>
                    Poista hakemus
                </button>
                : <button className="p-4 min-w-48 text-black font-extrabold rounded-md hover:bg-blue-100 bg-blue-50"
                    onClick={addApplication}>
                    Merkitse hakijaksi
                </button>}
        </div>
    )
}

function AdminEditApplicantsForm() {
    const { get } = useAuthenticatedRequests()
    const [search, setSearch] = useState<string>("")
    const [newApplicants, setNewApplicants] = useState<User[]>([])
    const [loading, setLoading] = useState<boolean>(false)

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const throttledSearch = useCallback(
        throttle((value: string) => {
            setLoading(true)
            get("/users/search", { q: value })
                .then((res: AxiosResponse<SearchUsersResponse, unknown>) => setNewApplicants(res.data.rows))
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }, 1000),
        []
    );

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        event.preventDefault()

        const value = event.target.value
        setSearch(value)

        if (value.length >= 3) {
            throttledSearch(value)
        } else {
            setNewApplicants([])
        }
    }

    return <div className="">
        <h1 className="font-extrabold text-xl mb-4">Muokkaa hakijoita</h1>
        <div className="flex flex-row items-center">
            <input type="text"
                className='w-full bg-blue-50 hover:bg-blue-100 p-2 border-blue-500 border-2'
                placeholder={"hae"}
                onChange={handleChange}
                value={search}
            />
            {loading && <Loading />}
        </div>
        {newApplicants.map(u => <UserListElem key={u.id} user={u} />)}
    </div>
}

export default AdminEditApplicantsForm;
