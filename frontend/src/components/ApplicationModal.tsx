import React from 'react';
import { useAppState } from '../hooks/useAppState';

interface ModalProps {
    onClose: () => void;
    children: React.ReactNode; // Add children prop
}

function Modal({ onClose, children }: ModalProps) {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 shadow-lg z-60 relative">
                {/* Close button inside the modal */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 bg-transparent text-gray-600 hover:text-gray-800 focus:outline-none"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 9.586L14.95 4.636a1 1 0 011.415 1.415l-4.95 4.95 4.95 4.95a1 1 0 01-1.415 1.415L10 12.414l-4.95 4.95a1 1 0 01-1.415-1.415l4.95-4.95-4.95-4.95a1 1 0 011.415-1.415L10 9.586z"
                            clipRule="evenodd"
                        />
                    </svg>
                </button>
                {children} {/* Render children here */}
            </div>
        </div>
    );
}

export default function ApplicationModal() {
    const { application, clearApplication } = useAppState();

    const handleClose = () => {
        clearApplication(); // Close the modal when the close button is clicked
    };

    if (!application) return null; // Don't render the modal if showModal is false

    return <Modal onClose={handleClose}>{application.content}</Modal>;
}
