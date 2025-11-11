
import React, { useEffect, useRef } from 'react';
import { XMarkIcon } from './icons';

interface ModalProps {
    children: React.ReactNode;
    onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ children, onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeydown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeydown);
        
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        // Use timeout to prevent closing on the same click that opened the modal
        setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
        }, 0);


        return () => {
            document.removeEventListener('keydown', handleKeydown);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div 
                ref={modalRef}
                className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] relative flex flex-col"
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-3 right-3 text-stone-400 hover:text-stone-700 transition-colors z-10"
                >
                    <XMarkIcon className="w-8 h-8" />
                </button>
                <div className="overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
