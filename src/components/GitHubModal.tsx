import React from 'react';

interface GitHubModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const GitHubModal: React.FC<GitHubModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
                <h3 className="text-xl font-bold mb-4">GitHub Repository</h3>
                <p className="mb-6">Explore or star our project on GitHub!</p>
                <div className="flex flex-col gap-2">
                    <a href="https://github.com/prajasus2308/attendance-2" target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded bg-[#2563EB] text-white text-center font-bold">View Repository</a>
                    <a href="https://github.com/prajasus2308/attendance-2/stargazers" target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded bg-[#EAB308] text-black text-center font-bold">Star Repository</a>
                    <button onClick={onClose} className="px-4 py-2 rounded bg-slate-100 text-slate-700 font-bold">Close</button>
                </div>
            </div>
        </div>
    );
};
