import { useRef, FormEvent, useState } from 'react';
import Editor, { EditorRef, ImageUploader } from './TextEditor'; // Assuming the RTEditor component is in the same directory
import { useAppState } from '../hooks/useAppState';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

const ApplyForm = () => {
    const { position, getPosition, setError, setShowApplicationForm } = useAppState()
    const { userId } = useAuth()
    const editorRef = useRef<EditorRef>(null);
    const [name, setName] = useState('');
    const [pfpUrl, setPfpUrl] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState<boolean>(false);

    const BLOB_URL = 'https://vaaliplatta.blob.core.windows.net/dev'
    const URL = 'http://localhost:8000/api'

    if (!position || position === "loading") return null

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitting(true)
        const editorHTML = editorRef.current?.getHTML();

        axios.post(URL + "/application", {
            content: editorHTML,
            applicant_name: name,
            applicant_id: userId,
            position_id: position.id.toString()
        }).then(() => {
            setShowApplicationForm(false)
            getPosition(position.id.toString())
        })
            .catch(error => {
                setError(error.toString())
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
                    onChange={(e) => setName(e.target.value)}
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
                        const formData = new FormData()
                        formData.append("file", file)
                        axios.post(URL + "/upload", formData, {
                            headers: {
                                "Content-Type": "multipart/form-data"
                            }
                        }).then(response => {
                            const newUrl = BLOB_URL + "/" + (response.data instanceof Array ? response.data[0] : response.data.toString());
                            setPfpUrl(newUrl)
                        }).catch(error => {
                            window.alert("Image upload failed, please try again!\n" + error.toString());
                            setPfpUrl(null)
                        })
                    }}
                >{pfpUrl ? <img src={pfpUrl}></img> : null}</ImageUploader>
                {pfpUrl ? <button
                    className="size-8 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full border border-transparent bg-blue-50 hover:bg-blue-100"
                    onClick={() => setPfpUrl(null)}>clear</button> : null}
            </div>
            <div>
                <label className="text-sm m-2 font-medium text-gray-700">Hakemusteksti</label>
                <Editor ref={editorRef} />
            </div>
            <br />
            <button
                type="submit"
                disabled={submitting}
                className="bg-blue-50 hover:bg-blue-100 rounded-md py-2 px-4 font-bold min-w-full my-2 inline-flex items-start"
            >{submitting ? "lähettää..." : "Lähetä"}</button>
        </form>
    );
};

export default ApplyForm;
