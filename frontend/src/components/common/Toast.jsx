import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ toast, onClose }) => {
  if (!toast) return null;

  const { message, type } = toast;

  const typeStyles = {
    success: 'bg-slate-900 text-white border-slate-800',
    error: 'bg-rose-900 text-white border-rose-800',
    info: 'bg-slate-800 text-white border-slate-700',
  };

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    error: <AlertCircle className="w-4 h-4 text-rose-400" />,
    info: <Info className="w-4 h-4 text-sky-400" />,
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div
        className={`flex items-center space-x-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
          typeStyles[type] || typeStyles.success
        }`}
      >
        {icons[type] || icons.success}
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-2 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
