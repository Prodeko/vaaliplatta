import { FormEvent, useEffect, useRef, useState } from 'react';
import Editor, { EditorRef } from './TextEditor';
import { State, useAppState } from '../hooks/useAppState';
import useAuthenticatedRequests from '../hooks/useAuthenticatedRequests';

const DEFAULT_POSITION_NAME = 'Uusi virka';
const DEFAULT_POSITION_DESCRIPTION = '<p><em>Lisää kuvaus tähän</em></p>';
const DEFAULT_POSITION_CATEGORY = 'toimarit';

const AdminEditElectionForm = () => {
    const {
        election,
        getElection,
        setShowAdminEditElectionModal,
    } = useAppState();
    const editorRef = useRef<EditorRef>(null);
    const [name, setName] = useState('');
    const [draft, setDraft] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [creatingPosition, setCreatingPosition] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [positionMessage, setPositionMessage] = useState<string | null>(null);
    const [newPositionName, setNewPositionName] = useState(DEFAULT_POSITION_NAME);
    const [newPositionCategory, setNewPositionCategory] = useState<string>(DEFAULT_POSITION_CATEGORY);
    const { put, post } = useAuthenticatedRequests();

    useEffect(() => {
        if (!election) return;

        setName(election.name);
        setDraft(election.draft);
        setNewPositionName(DEFAULT_POSITION_NAME);
        setNewPositionCategory(DEFAULT_POSITION_CATEGORY);
        setPositionMessage(null);
    }, [election]);

    if (!election) return null;

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitting(true);
        setError(null);

        const payload = {
            name,
            draft,
            description: editorRef.current?.getHTML() ?? '',
        };

        try {
            await put(`/election/${election.id.toString()}`, payload);
            await getElection(election.id.toString());
            setShowAdminEditElectionModal(false);
        } catch (submitError) {
            console.error(submitError);
            setError('Tallentaminen epäonnistui. Tarkista tiedot ja yritä uudelleen.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreatePosition = async () => {
        setCreatingPosition(true);
        setPositionMessage(null);
        setError(null);
        try {
            const trimmedName = newPositionName.trim();
            const response = await post('/position', {
                name: trimmedName || DEFAULT_POSITION_NAME,
                description: DEFAULT_POSITION_DESCRIPTION,
                seats: '1',
                election_id: election.id,
                category: newPositionCategory,
                state: State.DRAFT,
            });

            const createdName = response.data?.name ?? (trimmedName || DEFAULT_POSITION_NAME);
            setPositionMessage(`Luotiin uusi virka: ${createdName}`);
            setNewPositionName(DEFAULT_POSITION_NAME);
            setNewPositionCategory(DEFAULT_POSITION_CATEGORY);
            await getElection(election.id.toString());
        } catch (creationError) {
            console.error(creationError);
            setError('Uuden viran luonti epäonnistui. Yritä uudelleen.');
        } finally {
            setCreatingPosition(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h1 className="w-full m-2 text-black font-extrabold">
                Muokkaa vaalia {election.name}
            </h1>

            {error && (
                <p className="m-2 text-sm text-red-600">
                    {error}
                </p>
            )}

            {positionMessage && (
                <p className="m-2 text-sm text-green-600">
                    {positionMessage}
                </p>
            )}

            <div className="flex flex-col gap-2 my-4">
                <label htmlFor="election-name" className="text-sm font-medium text-gray-700">
                    Nimi
                </label>
                <input
                    id="election-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full border-gray-300 rounded-md bg-blue-50 hover:bg-blue-100 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                    required
                />
            </div>

            <div className="flex items-center gap-2 my-4">
                <input
                    id="election-draft"
                    type="checkbox"
                    checked={draft}
                    onChange={(e) => setDraft(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="election-draft" className="text-sm font-medium text-gray-700">
                    Luonnos
                </label>
            </div>

            <div className="my-4">
                <label className="text-sm font-medium text-gray-700">
                    Kuvaus
                </label>
                <Editor
                    ref={editorRef}
                    default_text={election.description ?? '<p><em>Lisää kuvaus tähän</em></p>'}
                />
            </div>

            <button
                type="submit"
                disabled={submitting}
                className="bg-blue-50 hover:bg-blue-100 rounded-md py-2 px-4 font-bold min-w-full my-2 inline-flex justify-center"
            >
                {submitting ? 'Tallennetaan...' : 'Tallenna muutokset'}
            </button>

            <div className="flex flex-col gap-2 my-4">
                <label htmlFor="new-position-name" className="text-sm font-medium text-gray-700">
                    Uuden viran nimi
                </label>
                <input
                    id="new-position-name"
                    type="text"
                    value={newPositionName}
                    onChange={(e) => setNewPositionName(e.target.value)}
                    className="block w-full border-gray-300 rounded-md bg-blue-50 hover:bg-blue-100 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                />
            </div>

            <div className="flex flex-col gap-2 my-4">
                <label htmlFor="new-position-category" className="text-sm font-medium text-gray-700">
                    Uuden viran kategoria
                </label>
                <select
                    id="new-position-category"
                    value={newPositionCategory}
                    onChange={(e) => setNewPositionCategory(e.target.value)}
                    className="block w-full border-gray-300 rounded-md bg-blue-50 hover:bg-blue-100 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                >
                    <option value="hallitus">hallitus</option>
                    <option value="vastuutoimarit">vastuutoimarit</option>
                    <option value="toimarit">toimarit</option>
                </select>
            </div>

            <button
                type="button"
                disabled={creatingPosition}
                onClick={handleCreatePosition}
                className="bg-green-50 hover:bg-green-100 rounded-md py-2 px-4 font-bold min-w-full my-2 inline-flex justify-center"
            >
                {creatingPosition ? 'Luodaan virkaa...' : 'Lisää uusi virka'}
            </button>
        </form>
    );
};

export default AdminEditElectionForm;
