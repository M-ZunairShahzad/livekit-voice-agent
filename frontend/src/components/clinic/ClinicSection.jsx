import React from 'react';
import { ClinicScheduleForm } from './ClinicScheduleForm';
import { FaqForm } from './FaqForm';
import { FaqList } from './FaqList';
import { Building2 } from 'lucide-react';

export const ClinicSection = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner Header */}
      <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="p-2 rounded-xl bg-teal-50 text-teal-700">
            <Building2 className="w-5 h-5" />
          </span>
          <h1 className="text-xl font-bold text-slate-900 font-sans tracking-tight">
            Clinic Schedule & FAQ Management
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1 max-w-xl">
          Manage overarching clinic operating schedules and publish patient knowledge base FAQs organized by category [Doctor, Lab, Clinics].
        </p>
      </div>

      {/* 1. Clinic Timings Form */}
      <ClinicScheduleForm />

      {/* 2. FAQs Form */}
      <FaqForm />

      {/* 3. Overview of Timings & Categorized FAQs */}
      <FaqList />
    </div>
  );
};
