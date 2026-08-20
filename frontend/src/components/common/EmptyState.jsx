import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState = ({ title, description, actionText, onAction, icon: Icon = Inbox }) => {
  return (
    <div className="text-center py-12 px-6 rounded-2xl bg-white border border-dashed border-slate-200 shadow-sm">
      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 font-sans">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-5">{description}</p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium transition-all shadow-sm shadow-teal-600/20"
        >
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};
