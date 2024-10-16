import React, { useEffect } from 'react';
import { useAppState } from '../hooks/useAppState';
import ApplyForm from './ApplyForm';
import HtmlRenderer from './HtmlRenderer';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode; // Add children prop
}

function Modal({ isOpen, onClose, children }: ModalProps) {

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = ''; // Clean up on unmount
        };
    }, [isOpen]);

    if (!isOpen) return null
    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 overflow-auto">
            {/* Add max-h-full to prevent exceeding viewport and enable scrolling */}
            <div className="bg-white rounded-lg p-6 shadow-lg relative mx-auto my-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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

export function ApplicationForm() {
    const { showApplicationForm, setShowApplicationForm } = useAppState();

    const handleClose = () => setShowApplicationForm(false)

    return <Modal isOpen={showApplicationForm} onClose={handleClose}><ApplyForm /></Modal>
}

export function ApplicationModal() {
    const { application, clearApplication } = useAppState();

    const handleClose = clearApplication // Close the modal when the close button is clicked

    return <Modal isOpen={!!application} onClose={handleClose}><HtmlRenderer htmlContent={application?.content} /></Modal>;
}
