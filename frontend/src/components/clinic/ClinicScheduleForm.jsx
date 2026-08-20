import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { WeeklySchedule } from '../common/WeeklySchedule';
import { Building2, Check } from 'lucide-react';

export const ClinicScheduleForm = () => {
  const { clinicTimings, updateClinicTimings } = useClinic();

  const [timings, setTimings] = useState(
    clinicTimings.length === 7
      ? clinicTimings
      : [
          { day: 'Monday', startTime: '08:00', endTime: '20:00', isClosed: false },
          { day: 'Tuesday', startTime: '08:00', endTime: '20:00', isClosed: false },
          { day: 'Wednesday', startTime: '08:00', endTime: '20:00', isClosed: false },
          { day: 'Thursday', startTime: '08:00', endTime: '20:00', isClosed: false },
          { day: 'Friday', startTime: '08:00', endTime: '20:00', isClosed: false },
          { day: 'Saturday', startTime: '09:00', endTime: '18:00', isClosed: false },
          { day: 'Sunday', startTime: '10:00', endTime: '14:00', isClosed: false },
        ]
  );

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    // ==========================================
    // ADD API HERE: Save main clinic operating hours schedule to DB
    // Example: await fetch('/api/clinic/timings', { method: 'PUT', body: JSON.stringify({ timings }) });
    // ==========================================
    await updateClinicTimings(timings);

    setIsSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
      <div className="border-b border-slate-100 pb-3.5">
        <div className="flex items-center space-x-2">
          <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
            <Building2 className="w-4 h-4" />
          </span>
          <h2 className="text-base font-semibold text-slate-900 font-sans">Main Clinic Timings</h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Configure master clinic working hours across all 7 days (Monday to Sunday) with Open/Closed toggles.
        </p>
      </div>

      <WeeklySchedule
        schedule={timings}
        onChange={setTimings}
        startLabel="Opening Time"
        endLabel="Closing Time"
        title="Master Weekly Clinic Schedule"
      />

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-sm shadow-teal-600/30 transition-all disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          <span>{isSaving ? 'Saving Timings...' : 'Save Clinic Timings'}</span>
        </button>
      </div>
    </form>
  );
};
