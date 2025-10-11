import React from 'react';
import { State } from '../hooks/useAppState';

interface AdminButtonsProps {
    positionState: State;
    onToggleStateClosed: () => void;
    onAddApplicants: () => void;
    onEditDescription: () => void;
}

const AdminButtons: React.FC<AdminButtonsProps> = ({ positionState, onToggleStateClosed, onAddApplicants, onEditDescription }) => {

    return (
        <>
            <button
                className="w-full p-4 mb-2 text-black font-extrabold rounded-md shadow-inner shadow-red-50 hover:bg-red-100 bg-red-50 border-2 border-red-50 hover:border-red-500 flex items-start"
                onClick={onToggleStateClosed}
            >
                {positionState === State.OPEN ? "Sulje hakemuksilta" : "Avaa hakemuksille"}
            </button>
            <button
                className="w-full p-4 mb-2 text-black font-extrabold rounded-md shadow-inner shadow-red-50 hover:bg-red-100 bg-red-50 border-2 border-red-50 hover:border-red-500 flex items-start"
                onClick={onAddApplicants}
            >
                Muokkaa hakijoita
            </button>
            <button
                className="w-full p-4 mb-2 text-black font-extrabold rounded-md shadow-inner shadow-red-50 hover:bg-red-100 bg-red-50 border-2 border-red-50 hover:border-red-500 flex items-start"
                onClick={onEditDescription}
            >
                Muokkaa kuvausta
            </button>
        </>
    );
};

export default AdminButtons;
