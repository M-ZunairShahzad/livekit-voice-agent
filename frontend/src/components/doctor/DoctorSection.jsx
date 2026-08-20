import React, { useState } from 'react';
import { DoctorForm } from './DoctorForm';
import { DoctorList } from './DoctorList';
import { Plus, UserCheck } from 'lucide-react';

export const DoctorSection = () => {
  const [showForm, setShowForm] = useState(true);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/95 backdrop-blur-md p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <UserCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 font-sans tracking-tight">
              Doctor Management
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Configure medical personnel profiles, specialties, current operating status, and daily consultation availability windows.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className={`w-4 h-4 transition-transform duration-200 ${showForm ? 'rotate-45' : ''}`} />
          <span>{showForm ? 'Hide Add Form' : 'Add New Doctor'}</span>
        </button>
      </div>

      {/* Form Container */}
      {showForm && (
        <DoctorForm onSuccess={() => setShowForm(true)} />
      )}

      {/* List Container */}
      <DoctorList onAddNew={() => setShowForm(true)} />
    </div>
  );
};
