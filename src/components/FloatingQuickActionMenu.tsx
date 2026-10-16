import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, FileText, Lock, Unlock, Zap, X } from 'lucide-react';

interface FloatingQuickActionMenuProps {
  onAddStudent: () => void;
  onGenerateReport: () => void;
  onToggleAttendanceLock: () => void;
  isLocked: boolean;
}

export const FloatingQuickActionMenu: React.FC<FloatingQuickActionMenuProps> = ({
  onAddStudent,
  onGenerateReport,
  onToggleAttendanceLock,
  isLocked,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="flex flex-col gap-3 mb-4"
          >
            <button onClick={onAddStudent} className="flex items-center gap-2 bg-white p-3 rounded-full shadow-lg hover:bg-slate-50 border border-slate-200 px-4">
              <Plus className="size-6 text-[#2563EB]" />
              <span className="font-bold text-sm whitespace-nowrap">Add Student</span>
            </button>
            <button onClick={onGenerateReport} className="flex items-center gap-2 bg-white p-3 rounded-full shadow-lg hover:bg-slate-50 border border-slate-200 px-4">
              <FileText className="size-6 text-[#2563EB]" />
              <span className="font-bold text-sm whitespace-nowrap">Generate Report</span>
            </button>
            <button onClick={onToggleAttendanceLock} className="flex items-center gap-2 bg-white p-3 rounded-full shadow-lg hover:bg-slate-200 border border-slate-200 px-4">
              {isLocked ? <Unlock className="size-6 text-green-600" /> : <Lock className="size-6 text-red-600" />}
              <span className="font-bold text-sm whitespace-nowrap">{isLocked ? 'Unlock' : 'Lock'}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#2563EB] text-white p-4 rounded-full shadow-xl hover:bg-[#1d4ed8] transition-colors"
      >
        {isOpen ? <X className="size-8" /> : <Zap className="size-8" />}
      </button>
    </div>
  );
};
