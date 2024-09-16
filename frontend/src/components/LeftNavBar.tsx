import { useState } from 'react';
import { Transition } from '@headlessui/react';

const LeftNavBar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isOpen2, setIsOpen2] = useState(false);

    return (
        <div className="flex flex-col space-y-2 bg-white">
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center justify-between w-full px-4 py-2 text-black hover:bg-slate-200 rounded-md focus:outline-none">
                    <span className="font-extrabold">HALLITUS</span>
                    <span className={`text-black ${isOpen ? 'transform rotate-180' : ''}`}>
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </span>
                </button>
                <div
                    className={`origin-top transition-all transform ${isOpen ? 'scale-y-100' : 'scale-y-0'} 
        max-h-60 overflow-hidden bg-white border-t-0 rounded-md shadow-lg`}
                    style={{ maxHeight: isOpen ? '15rem' : '0' }}
                >
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-100">Option 1</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-100">Option 2</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-100">Option 3</a>
                </div>
            </div>
            {/* TOINEN LUOKKA */}
            <div className="relative">
                <button
                    onClick={() => setIsOpen2(!isOpen2)}
                    className="flex items-center justify-between w-full px-4 py-2 text-black hover:bg-slate-200 rounded-md focus:outline-none">
                    <span className="font-extrabold">TOIMARIT</span>
                    <span className={`text-black ${isOpen2 ? 'transform rotate-180' : ''}`}>
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </span>
                </button>
                <div
                    className={`origin-top transition-all transform ${isOpen2 ? 'scale-y-100' : 'scale-y-0'} 
        max-h-60 overflow-hidden bg-white border-t-0 rounded-md shadow-lg`}
                    style={{ maxHeight: isOpen2 ? '15rem' : '0' }}
                >
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-100">Option 1</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-100">Option 2</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-100">Option 3</a>
                </div>
            </div>
        </div>
    );
};

export default LeftNavBar;

