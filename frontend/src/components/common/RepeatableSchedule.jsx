import React from 'react';
import { Plus, Trash2, Clock } from 'lucide-react';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const RepeatableSchedule = ({
  scheduleItems = [],
  onChange,
  showIsClosed = true,
  startLabel = 'Opening Time',
  endLabel = 'Closing Time',
  title = 'Operating Schedule',
}) => {
  const handleAddRow = () => {
    // Pick first available day or default to Monday
    const usedDays = scheduleItems.map((item) => item.day);
    const availableDay = DAYS_OF_WEEK.find((d) => !usedDays.includes(d)) || 'Monday';

    const newItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      day: availableDay,
      startTime: '09:00',
      endTime: '17:00',
      isClosed: false,
    };
    onChange([...scheduleItems, newItem]);
  };

  const handleRemoveRow = (id) => {
    onChange(scheduleItems.filter((item) => item.id !== id));
  };

  const handleUpdateRow = (id, field, value) => {
    onChange(
      scheduleItems.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2 text-sm font-medium text-slate-800">
          <Clock className="w-4 h-4 text-teal-600" />
          <span>{title}</span>
        </label>
        <button
          type="button"
          onClick={handleAddRow}
          className="inline-flex items-center space-x-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2.5 py-1 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Day Schedule</span>
        </button>
      </div>

      {scheduleItems.length === 0 ? (
        <div className="text-center py-4 px-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs text-slate-500">
          No timing entries added. Click "Add Day Schedule" to define hours.
        </div>
      ) : (
        <div className="space-y-2">
          {scheduleItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 transition-all hover:border-slate-300"
            >
              {/* Day Dropdown */}
              <div className="w-full sm:w-36">
                <select
                  value={item.day}
                  onChange={(e) => handleUpdateRow(item.id, 'day', e.target.value)}
                  className="w-full text-xs font-medium bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                >
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Is Closed Toggle (If enabled) */}
              {showIsClosed && (
                <div className="flex items-center space-x-2 mr-1">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.isClosed}
                      onChange={(e) => handleUpdateRow(item.id, 'isClosed', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-rose-500"></div>
                  </label>
                  <span className={`text-xs font-medium ${item.isClosed ? 'text-rose-600 font-semibold' : 'text-slate-500'}`}>
                    {item.isClosed ? 'Closed' : 'Open'}
                  </span>
                </div>
              )}

              {/* Start & End Times */}
              {!item.isClosed && (
                <div className="flex items-center space-x-2 flex-1">
                  <div className="flex-1 min-w-[100px]">
                    <span className="block text-[10px] text-slate-400 mb-0.5">{startLabel}</span>
                    <input
                      type="time"
                      value={item.startTime || '09:00'}
                      onChange={(e) => handleUpdateRow(item.id, 'startTime', e.target.value)}
                      className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                    />
                  </div>
                  <span className="text-slate-300 font-bold self-end mb-1.5">-</span>
                  <div className="flex-1 min-w-[100px]">
                    <span className="block text-[10px] text-slate-400 mb-0.5">{endLabel}</span>
                    <input
                      type="time"
                      value={item.endTime || '17:00'}
                      onChange={(e) => handleUpdateRow(item.id, 'endTime', e.target.value)}
                      className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                    />
                  </div>
                </div>
              )}

              {/* Remove Action Button */}
              <button
                type="button"
                onClick={() => handleRemoveRow(item.id)}
                className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors self-center ml-auto"
                title="Remove schedule row"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
