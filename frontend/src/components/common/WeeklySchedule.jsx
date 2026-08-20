import React from 'react';
import { Clock } from 'lucide-react';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const WeeklySchedule = ({
  schedule = [],
  onChange,
  title = '7-Day Operational Timings',
}) => {
  // Normalize schedule array to guarantee all 7 days exist
  const getNormalizedSchedule = () => {
    return DAYS_OF_WEEK.map((day) => {
      const existing = schedule.find((item) => item.day === day);
      if (existing) return existing;
      return {
        day,
        startTime: '09:00',
        endTime: '17:00',
        isClosed: day === 'Sunday',
      };
    });
  };

  const currentSchedule = getNormalizedSchedule();

  const handleUpdateDay = (dayName, field, value) => {
    const updated = currentSchedule.map((item) => {
      if (item.day === dayName) {
        return { ...item, [field]: value };
      }
      return item;
    });
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {/* Title */}
      <div className="flex items-center space-x-2 border-b border-slate-100 pb-2.5">
        <Clock className="w-4 h-4 text-teal-600" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
          {title}
        </span>
      </div>

      {/* Table Structure */}
      <div className="bg-slate-50/50 rounded-2xl border border-slate-200/80 overflow-hidden">
        {/* Table Column Headers (Rendered ONCE at the top) */}
        <div className="grid grid-cols-12 gap-3 px-5 py-2.5 bg-slate-100/70 border-b border-slate-200/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          <div className="col-span-3">Day</div>
          <div className="col-span-3">Status</div>
          <div className="col-span-3 text-center">Opening Time</div>
          <div className="col-span-3 text-center">Closing Time</div>
        </div>

        {/* 7 Clean Day Rows */}
        <div className="divide-y divide-slate-100 bg-white">
          {currentSchedule.map((item) => {
            const isClosed = item.isClosed;

            return (
              <div
                key={item.day}
                className={`grid grid-cols-12 gap-3 px-5 py-3 items-center transition-colors ${
                  isClosed ? 'bg-slate-50/60' : 'hover:bg-teal-50/20'
                }`}
              >
                {/* 1. Day Name */}
                <div className="col-span-3">
                  <span
                    className={`text-sm font-semibold font-sans ${
                      isClosed ? 'text-slate-400' : 'text-slate-900'
                    }`}
                  >
                    {item.day}
                  </span>
                </div>

                {/* 2. Open / Closed Toggle Switch */}
                <div className="col-span-3 flex items-center space-x-2.5">
                  <button
                    type="button"
                    onClick={() => handleUpdateDay(item.day, 'isClosed', !isClosed)}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      !isClosed ? 'bg-teal-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        !isClosed ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>

                  <span
                    className={`text-xs font-semibold ${
                      !isClosed ? 'text-teal-700' : 'text-slate-400'
                    }`}
                  >
                    {!isClosed ? 'Open' : 'Closed'}
                  </span>
                </div>

                {/* 3. Opening Time Input */}
                <div className="col-span-3 text-center">
                  {!isClosed ? (
                    <input
                      type="time"
                      value={item.startTime || '09:00'}
                      onChange={(e) => handleUpdateDay(item.day, 'startTime', e.target.value)}
                      className="w-full max-w-[140px] text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-center text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all inline-block"
                    />
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">—</span>
                  )}
                </div>

                {/* 4. Closing Time Input */}
                <div className="col-span-3 text-center">
                  {!isClosed ? (
                    <input
                      type="time"
                      value={item.endTime || '17:00'}
                      onChange={(e) => handleUpdateDay(item.day, 'endTime', e.target.value)}
                      className="w-full max-w-[140px] text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-center text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all inline-block"
                    />
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
