import { useRef, FormEvent, useState, useEffect } from 'react';
import Editor, { EditorRef } from './TextEditor';
import { State, useAppState } from '../hooks/useAppState';
import useAuthenticatedRequests from '../hooks/useAuthenticatedRequests';

const AdminEditPositionDescriptionForm = () => {
    const {
        position,
        getPosition,
        clearPosition,
        setShowAdminEditPositionDescriptionModal,
    } = useAppState();
    const editorRef = useRef<EditorRef>(null);
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [seats, setSeats] = useState('');
    const [stateValue, setStateValue] = useState<State>(State.DRAFT);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [deleting, setDeleting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { put, axiosdelete } = useAuthenticatedRequests();

    useEffect(() => {
        if (!position || position === "loading") return;

        setName(position.name ?? '');
        setCategory(position.category ?? '');
        setSeats(position.seats ?? '');
        setStateValue(position.state);
    }, [position]);

    if (!position || position === "loading") return null;

    const handleDelete = async () => {
        if (!confirm(`Haluatko poistaa viran ${position.name}? Tätä ei voi perua!`)) return;

        setDeleting(true);
        setError(null);
        try {
            await axiosdelete(`/position/${position.id.toString()}`);
            clearPosition();
            setShowAdminEditPositionDescriptionModal(false);
        } catch (deleteError) {
            console.error(deleteError);
            setError('Viran poistaminen epäonnistui. Yritä uudelleen.');
        } finally {
            setDeleting(false);
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!position) return;

        setSubmitting(true);
        setError(null);

        const payload = {
            name,
            category,
            seats,
            description: editorRef.current?.getHTML() ?? '',
            state: stateValue,
        };

        try {
            await put(`/position/${position.id.toString()}`, payload);
            await getPosition(position.id.toString());
            setShowAdminEditPositionDescriptionModal(false);
        } catch (submitError) {
            console.error(submitError);
            setError('Tallentaminen epäonnistui. Tarkista tiedot ja yritä uudelleen.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h1 className="w-full m-2 text-black font-extrabold">
                Muokkaa virkaa {position.name}
            </h1>

            {error && (
                <p className="m-2 text-sm text-red-600">
                    {error}
                </p>
            )}

            <div className="flex flex-col gap-2 my-4">
                <label htmlFor="position-name" className="text-sm font-medium text-gray-700">
                    Nimi
                </label>
                <input
                    id="position-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full border-gray-300 rounded-md bg-blue-50 hover:bg-blue-100 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                    required
                />
            </div>

            <div className="flex flex-col gap-2 my-4">
                <label htmlFor="position-category" className="text-sm font-medium text-gray-700">
                    Kategoria
                </label>
                <select
                    id="position-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="block w-full border-gray-300 rounded-md bg-blue-50 hover:bg-blue-100 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                    required
                >
                    <option value="hallitus">Hallitus</option>
                    <option value="vastuutoimarit">Vastuutoimarit</option>
                    <option value="toimarit">Toimarit</option>
                </select>
            </div>

            <div className="flex flex-col gap-2 my-4">
                <label htmlFor="position-seats" className="text-sm font-medium text-gray-700">
                    Paikkojen määrä
                </label>
                <input
                    id="position-seats"
                    type="text"
                    value={seats}
                    onChange={(e) => setSeats(e.target.value)}
                    className="block w-full border-gray-300 rounded-md bg-blue-50 hover:bg-blue-100 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                />
            </div>

            <div className="flex flex-col gap-2 my-4">
                <label htmlFor="position-state" className="text-sm font-medium text-gray-700">
                    Tila
                </label>
                <select
                    id="position-state"
                    value={stateValue}
                    onChange={(e) => setStateValue(e.target.value as State)}
                    className="block w-full border-gray-300 rounded-md bg-blue-50 hover:bg-blue-100 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                >
                    <option value={State.DRAFT}>Luonnos</option>
                    <option value={State.OPEN}>Auki</option>
                    <option value={State.CLOSED}>Suljettu</option>
                    <option value={State.ARCHIVED}>Arkistoitu</option>
                </select>
            </div>

            <div className="my-4">
                <label className="text-sm font-medium text-gray-700">
                    Kuvaus
                </label>
                <Editor ref={editorRef} default_text={position.description ?? '<p><em>Lisää kuvaus tähän</em></p>'} />
            </div>

            <button
                type="submit"
                disabled={submitting}
                className="bg-blue-50 hover:bg-blue-100 rounded-md py-2 px-4 font-bold min-w-full my-2 inline-flex justify-center"
            >
                {submitting ? "Tallennetaan..." : "Tallenna muutokset"}
            </button>

            <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="bg-red-50 hover:bg-red-100 rounded-md py-2 px-4 font-bold min-w-full my-2 inline-flex justify-center"
            >
                {deleting ? "Poistetaan..." : "Poista virka"}
            </button>
        </form>
    );
};

export default AdminEditPositionDescriptionForm;
