import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
                <h3 className="text-xl font-bold mb-4">{title}</h3>
                <p className="mb-6">{message}</p>
                <div className="flex justify-end gap-2">
                    <button onClick={onCancel} className="px-4 py-2 rounded bg-slate-100 text-slate-700">Cancel</button>
                    <button onClick={() => { onConfirm(); onCancel(); }} className="px-4 py-2 rounded bg-red-600 text-white">Confirm</button>
                </div>
            </div>
        </div>
    );
};
