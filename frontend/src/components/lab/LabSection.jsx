import React from 'react';
import { LabForm } from './LabForm';
import { LabList } from './LabList';
import { FlaskConical } from 'lucide-react';

export const LabSection = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="p-2 rounded-xl bg-teal-50 text-teal-700">
            <FlaskConical className="w-5 h-5" />
          </span>
          <h1 className="text-xl font-bold text-slate-900 font-sans tracking-tight">
            Lab Test & Operating Hours Management
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1 max-w-xl">
          Set up lab test catalog items, pricing structures in PKR, availability toggles, and daily laboratory working hours schedules.
        </p>
      </div>

      {/* Forms (Test Creation + Timings Schedule) */}
      <LabForm />

      {/* Lab Test Catalog & Schedule Grid */}
      <LabList />
    </div>
  );
};
