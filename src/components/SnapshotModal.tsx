import React from 'react';

interface SnapshotModalProps {
    isOpen: boolean;
    onClose: () => void;
    photoData?: string;
}

export const SnapshotModal: React.FC<SnapshotModalProps> = ({ isOpen, onClose, photoData }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-auto max-w-lg shadow-lg">
                <h3 className="text-xl font-bold mb-4">Captured Snapshot</h3>
                {photoData ? (
                    <img src={photoData} alt="Captured face" className="rounded-lg mb-6 w-full" />
                ) : (
                    <p className="mb-6">No photo available.</p>
                )}
                <button onClick={onClose} className="px-4 py-2 rounded bg-slate-100 text-slate-700 font-bold w-full">Close</button>
            </div>
        </div>
    );
};
