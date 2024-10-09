import { useState } from 'react';
import { useAppState } from '../hooks/useAppState';

interface DropdownProps {
    label: string;
    defaultOpen?: boolean;
    children: React.ReactNode;
}

function Dropdown({ label, defaultOpen = false, children }: DropdownProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const toggleDropdown = () => {
        setIsOpen(prevState => !prevState);
    };

    return (
        <div className="relative">
            <button
                onClick={toggleDropdown}
                className="flex items-center justify-between w-full p-4 text-black hover:bg-slate-200 rounded-md focus:outline-none"
                aria-expanded={isOpen}
                aria-controls={`${label}-dropdown`}
            >
                <span className="font-extrabold">{label}</span>
                <span className={`text-black transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </span>
            </button>
            <div
                id={`${label}-dropdown`}
                className={`origin-top transition-all transform ${isOpen ? 'scale-y-100' : 'scale-y-0'} max-h-60 overflow-hidden bg-white border-t-0 rounded-md shadow-lg`}
                style={{ maxHeight: isOpen ? '15rem' : '0' }}
            >
                {children}
            </div>
        </div>
    );
}

export default function LeftNavBar() {
    const { election, position, getPosition, clearPosition } = useAppState();

    return (
        <div className="w-full">
            {position && (
                <button
                    onClick={clearPosition}
                    className="w-full p-4 text-black font-extrabold hover:bg-slate-200 rounded-md focus:outline-none"
                >
                    <div className='text-left'>
                        ETUSIVULLE
                    </div>
                </button>
            )}
            <Dropdown label='HALLITUS'>
                {election?.positions.map(p => (
                    <button
                        onClick={() => getPosition(p.id.toString())}
                        className="p-4 text-sm text-gray-700 hover:bg-blue-100 w-full flex items-start"
                        key={p.id}
                    >
                        {p.name}
                    </button>
                ))}
            </Dropdown>
        </div>
    );
}
