import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { WeeklySchedule } from '../common/WeeklySchedule';
import { FlaskConical, ToggleLeft, ToggleRight, Check, Clock, Coins } from 'lucide-react';

export const LabForm = () => {
  const { addLabTest, labTimings, updateLabTimings } = useClinic();

  // Form state for Lab Test creation
  const [testName, setTestName] = useState('');
  const [price, setPrice] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isSubmittingTest, setIsSubmittingTest] = useState(false);

  // Initialized 7 Days Schedule
  const [timings, setTimings] = useState(
    labTimings.length === 7
      ? labTimings
      : [
          { day: 'Monday', startTime: '08:00', endTime: '20:00', isClosed: false },
          { day: 'Tuesday', startTime: '08:00', endTime: '20:00', isClosed: false },
          { day: 'Wednesday', startTime: '08:00', endTime: '20:00', isClosed: false },
          { day: 'Thursday', startTime: '08:00', endTime: '20:00', isClosed: false },
          { day: 'Friday', startTime: '08:00', endTime: '20:00', isClosed: false },
          { day: 'Saturday', startTime: '09:00', endTime: '15:00', isClosed: false },
          { day: 'Sunday', startTime: '00:00', endTime: '00:00', isClosed: true },
        ]
  );
  const [isSavingTimings, setIsSavingTimings] = useState(false);

  // Submit new Lab Test
  const handleTestSubmit = async (e) => {
    e.preventDefault();
    if (!testName.trim() || !price) return;

    setIsSubmittingTest(true);

    const testData = {
      testName: testName.trim(),
      price: parseFloat(price),
      currency: 'PKR',
      isAvailable,
    };

    // ==========================================
    // ADD API HERE: Save lab test entry to backend API
    // Example: const res = await fetch('/api/lab/tests', { method: 'POST', body: JSON.stringify(testData) });
    // ==========================================
    const success = await addLabTest(testData);

    setIsSubmittingTest(false);

    if (success) {
      setTestName('');
      setPrice('');
      setIsAvailable(true);
    }
  };

  // Save Lab Timings Schedule
  const handleSaveTimings = async (e) => {
    e.preventDefault();
    setIsSavingTimings(true);

    // ==========================================
    // ADD API HERE: Save lab operational schedule to backend DB
    // Example: await fetch('/api/lab/timings', { method: 'PUT', body: JSON.stringify({ timings }) });
    // ==========================================
    await updateLabTimings(timings);

    setIsSavingTimings(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Add Lab Test Form */}
      <form onSubmit={handleTestSubmit} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="border-b border-slate-100 pb-3.5 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
                <FlaskConical className="w-4 h-4" />
              </span>
              <h2 className="text-base font-semibold text-slate-900 font-sans">Add Diagnostic Lab Test</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Specify test title, price catalog rate in PKR (Pakistani Rupees), and availability status.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Test Name */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Test Name *
            </label>
            <input
              type="text"
              required
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              placeholder="e.g. Complete Blood Count (CBC) & Lipid Profile"
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
            />
          </div>

          {/* Price (PKR) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center space-x-1">
              <Coins className="w-3.5 h-3.5 text-teal-600" />
              <span>Price (PKR / Rs.) *</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                PKR
              </span>
              <input
                type="number"
                step="1"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="1500"
                className="w-full text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100">
          {/* Availability Toggle */}
          <div className="w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsAvailable(!isAvailable)}
              className={`inline-flex items-center space-x-3 px-4 py-2 rounded-xl border text-xs font-semibold transition-all ${
                isAvailable
                  ? 'bg-teal-50 border-teal-200 text-teal-900'
                  : 'bg-slate-100 border-slate-200 text-slate-500'
              }`}
            >
              <span>{isAvailable ? 'Available Now' : 'Currently Unavailable'}</span>
              {isAvailable ? (
                <ToggleRight className="w-5 h-5 text-teal-600" />
              ) : (
                <ToggleLeft className="w-5 h-5 text-slate-400" />
              )}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmittingTest}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-sm shadow-teal-600/30 transition-all disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{isSubmittingTest ? 'Saving Test...' : 'Save Lab Test'}</span>
          </button>
        </div>
      </form>

      {/* 2. Configure 7-Day Lab Operational Timings (Full Width Card Grid) */}
      <form onSubmit={handleSaveTimings} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="border-b border-slate-100 pb-3.5">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
              <Clock className="w-4 h-4" />
            </span>
            <h2 className="text-base font-semibold text-slate-900 font-sans">Lab Operational Timings</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure weekly working hours for Monday through Sunday. Use quick preset buttons for 1-click scheduling.
          </p>
        </div>

        <WeeklySchedule
          schedule={timings}
          onChange={setTimings}
          startLabel="Opening Time"
          endLabel="Closing Time"
          title="7-Day Lab Operational Schedule"
        />

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="submit"
            disabled={isSavingTimings}
            className="inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-all shadow-sm disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{isSavingTimings ? 'Saving Schedule...' : 'Save Lab Timings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
