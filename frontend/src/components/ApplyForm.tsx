import { useRef, FormEvent, useState, useEffect } from 'react';
import Editor, { EditorRef, ImageUploader } from './TextEditor'; // Assuming the RTEditor component is in the same directory
import { useAppState } from '../hooks/useAppState';
import useAuthenticatedRequests from '../hooks/useAuthenticatedRequests';
import useConfig from '../hooks/useConfig';
import { useAuth } from '../hooks/useAuth';

type ApplicationDraft = {
    content?: string
    name?: string
    pfpUrl?: string | null
}

const readDraft = (key: string | null): ApplicationDraft | null => {
    if (!key) return null
    try {
        const stored = window.localStorage.getItem(key)
        return stored ? JSON.parse(stored) as ApplicationDraft : null
    } catch {
        return null
    }
}

// Merges into the stored draft so each field can be saved from its own handler.
const saveDraft = (key: string | null, fields: ApplicationDraft) => {
    if (!key) return
    try {
        window.localStorage.setItem(key, JSON.stringify({ ...readDraft(key), ...fields }))
    } catch {
        // Storage full or disabled: the form keeps working without a draft.
    }
}

const clearDraft = (key: string | null) => {
    if (!key) return
    try {
        window.localStorage.removeItem(key)
    } catch {
        // Storage disabled
    }
}

const ApplyForm = () => {
    const { position, getPosition, setShowApplicationForm, ownApplication } = useAppState();
    const { session } = useAuth();
    const { BLOB_URL } = useConfig();
    const editorRef = useRef<EditorRef>(null);
    const positionId = position && position !== "loading" ? position.id.toString() : null
    const draftKey = session && positionId ? `application-draft:${session.pk}:${positionId}` : null
    const [draft] = useState(() => readDraft(draftKey))
    const [name, setName] = useState(draft?.name ?? '');
    const [pfpUrl, setPfpUrl] = useState<string | null>(draft?.pfpUrl ?? null);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [showDeleteButton, setShowDeleteButton] = useState<boolean>(false);
    const { post, upload, axiosdelete } = useAuthenticatedRequests()

    useEffect(() => {
        if (ownApplication) {
            if (draft?.name === undefined) setName(ownApplication.applicant_name)
            if (draft?.pfpUrl === undefined) setPfpUrl(ownApplication.profile_picture || null)
            setShowDeleteButton(true)
        }
    }, [ownApplication, draft])

    if (!position || position === "loading") return null

    const updateName = (value: string) => {
        setName(value)
        saveDraft(draftKey, { name: value })
    }

    // A blob: URL is a local preview that doesn't survive a reload, so only uploaded URLs are saved.
    const updatePfpUrl = (url: string | null) => {
        setPfpUrl(url)
        if (!url?.startsWith('blob:')) saveDraft(draftKey, { pfpUrl: url })
    }

    const handleDelete = () => {
        setSubmitting(true)

        axiosdelete(`/position/${position.id.toString()}/myapplication`)
            .then(() => {
                clearDraft(draftKey)
                setShowApplicationForm(false)
                getPosition(position.id.toString())
            })
            .catch(error => {
                window.alert("Deleting application failed, please try again!\n" + error.toString());
                console.error(error)
            })
            .finally(() => setSubmitting(false))
    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitting(true)
        const editorHTML = editorRef.current?.getHTML();

        post("/application", {
            content: editorHTML,
            applicant_name: name,
            position_id: position.id.toString(),
            profile_picture: pfpUrl,
        }).then(() => {
            clearDraft(draftKey)
            setShowApplicationForm(false)
            getPosition(position.id.toString())
        })
            .catch(error => {
                window.alert("Image upload failed, please try again!\n" + error.toString());
                console.error(error)
            })
            .finally(() => setSubmitting(false))
    };

    return (
        <form onSubmit={handleSubmit}>
            <h1 className="w-full m-2 text-black font-extrabold rounded-mds flex sitems-start">
                Hae virkaan {position?.name}
            </h1>
            <div className="flex gap-4 my-4">
                <label htmlFor="name" className="block m-2 text-sm font-medium text-gray-700">Nimi</label>
                <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => updateName(e.target.value)}
                    className="m-2 block w-full border-gray-300 rounded-md bg-blue-50 hover:bg-blue-100 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                />
            </div>
            <div className="flex align-middle gap-4 my-4">
                <label className="text-sm m-2 font-medium text-gray-700">Lisää profiilikuva</label>
                <ImageUploader
                    highlight={true}
                    onFile={(file: File) => {
                        setPfpUrl((window.URL || window.webkitURL).createObjectURL(file))
                        upload(file)
                            .then(response => {
                                const newUrl = BLOB_URL + "/" + (response.data instanceof Array ? response.data[0] : response.data.toString());
                                updatePfpUrl(newUrl)
                            }).catch(error => {
                                window.alert("Image upload failed, please try again!\n" + error.toString());
                                updatePfpUrl(null)
                            })
                    }}
                >{pfpUrl ? <img src={pfpUrl}></img> : null}</ImageUploader>
                {pfpUrl ? <button
                    className="size-8 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full border border-transparent bg-blue-50 hover:bg-blue-100"
                    onClick={() => updatePfpUrl(null)}>clear</button> : null}
            </div>
            <div>
                <label className="text-sm m-2 font-medium text-gray-700">Hakemusteksti</label>
                <Editor
                    ref={editorRef}
                    default_text={draft?.content}
                    onUpdate={(html) => saveDraft(draftKey, { content: html })}
                />
            </div>
            <br />
            <button
                type="submit"
                disabled={submitting}
                className="bg-blue-50 hover:bg-blue-100 rounded-md py-2 px-4 font-bold min-w-full my-2 inline-flex items-start"
            >{submitting ? "lähettää..." : "Lähetä"}</button>
            {showDeleteButton && <button
                type="button"
                disabled={submitting}
                onClick={handleDelete}
                className="bg-red-50 hover:bg-red-100 rounded-md py-2 px-4 font-bold min-w-full my-2 inline-flex items-start"
            >{submitting ? "poistetaan..." : "Poista hakemus"}</button>}
        </form>
    );
};

export default ApplyForm;
