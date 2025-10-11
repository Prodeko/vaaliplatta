import { FormEvent, useRef, useState } from 'react';
import Editor, { EditorRef } from './TextEditor';
import { State, useAppState } from '../hooks/useAppState';
import useAuthenticatedRequests from '../hooks/useAuthenticatedRequests';

const DEFAULT_ELECTION_DESCRIPTION = `
<h2>Vaalien kuvaus</h2>
<p><em>Kirjoita vaalien kuvaus tähän</em></p>
`;

const AdminCreateElectionForm = () => {
    const {
        election,
        getElection,
        clearPosition,
        setShowAdminCreateElectionModal,
    } = useAppState();
    const editorRef = useRef<EditorRef>(null);
    const [name, setName] = useState('');
    const [stateValue, setStateValue] = useState<State>(State.DRAFT);
    const [clonePositions, setClonePositions] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { post } = useAuthenticatedRequests();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitting(true);
        setError(null);

        const payload = {
            name: name.trim(),
            state: stateValue,
            description: editorRef.current?.getHTML() ?? DEFAULT_ELECTION_DESCRIPTION,
            cloneFromElectionId: clonePositions ? election?.id : undefined,
        };

        if (!payload.name) {
            setError('Anna vaaleille nimi.');
            setSubmitting(false);
            return;
        }

        try {
            const response = await post('/election', payload);
            const createdElection = response.data;

            if (createdElection?.id) {
                await getElection(createdElection.id.toString());
            } else {
                await getElection('newest');
            }

            clearPosition();
            setShowAdminCreateElectionModal(false);
            setName('');
            setStateValue(State.DRAFT);
            setClonePositions(true);
        } catch (createError) {
            console.error(createError);
            setError('Vaalien luonti epäonnistui. Yritä uudelleen.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h1 className="w-full m-2 text-black font-extrabold">
                Luo uudet vaalit
            </h1>

            {error && (
                <p className="m-2 text-sm text-red-600">
                    {error}
                </p>
            )}

            <div className="flex flex-col gap-2 my-4">
                <label htmlFor="new-election-name" className="text-sm font-medium text-gray-700">
                    Vaalien nimi
                </label>
                <input
                    id="new-election-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full border-gray-300 rounded-md bg-blue-50 hover:bg-blue-100 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                    placeholder="Esim. Vaali 2025"
                    required
                />
            </div>

            <div className="flex flex-col gap-2 my-4">
                <label htmlFor="new-election-state" className="text-sm font-medium text-gray-700">
                    Tila
                </label>
                <select
                    id="new-election-state"
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

            {election && (
                <div className="flex items-center gap-2 my-4">
                    <input
                        id="clone-positions"
                        type="checkbox"
                        checked={clonePositions}
                        onChange={(e) => setClonePositions(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="clone-positions" className="text-sm font-medium text-gray-700">
                        Kopioi edellisen vaalin virat
                    </label>
                </div>
            )}

            <div className="my-4">
                <label className="text-sm font-medium text-gray-700">
                    Kuvaus
                </label>
                <Editor
                    ref={editorRef}
                    default_text={DEFAULT_ELECTION_DESCRIPTION}
                />
            </div>

            <button
                type="submit"
                disabled={submitting}
                className="bg-green-50 hover:bg-green-100 rounded-md py-2 px-4 font-bold min-w-full my-2 inline-flex justify-center"
            >
                {submitting ? 'Luodaan...' : 'Luo vaalit'}
            </button>
        </form>
    );
};

export default AdminCreateElectionForm;
