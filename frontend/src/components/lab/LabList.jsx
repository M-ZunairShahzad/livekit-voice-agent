import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { FlaskConical, Trash2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { EmptyState } from '../common/EmptyState';

export const LabList = () => {
  const { labTests, removeLabTest, labTimings } = useClinic();

  return (
    <div className="space-y-6">
      {/* Active Lab Tests Section */}
      <div>
        <h3 className="text-sm font-semibold text-slate-800 font-sans uppercase tracking-wider mb-3">
          Lab Test Catalog ({labTests.length})
        </h3>

        {labTests.length === 0 ? (
          <EmptyState
            icon={FlaskConical}
            title="No Lab Tests Configured"
            description="No diagnostic tests are currently saved in the database. Use the form above to add test offerings."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {labTests.map((test) => (
              <div
                key={test.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between hover:border-slate-300 transition-all"
              >
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-slate-900 font-sans">{test.testName}</h4>
                  <div className="flex items-center space-x-3 text-xs">
                    <span className="font-semibold font-mono text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200/60">
                      PKR {Number(test.price).toLocaleString()}
                    </span>
                    <span
                      className={`inline-flex items-center space-x-1 font-medium ${
                        test.isAvailable ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      {test.isAvailable ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Available</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Unavailable</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    // ==========================================
                    // ADD API HERE: Call delete lab test API hook
                    // Example: await deleteLabTestApi(test.id);
                    // ==========================================
                    removeLabTest(test.id);
                  }}
                  className="text-slate-400 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 transition-colors"
                  title="Delete Lab Test"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lab Operating Timings Overview */}
      {labTimings && labTimings.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2 mb-3">
            <Clock className="w-4 h-4 text-teal-600" />
            <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
              Saved Lab Operational Schedule (7 Days)
            </h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {labTimings.map((timing, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-xl border text-center text-xs ${
                  timing.isClosed
                    ? 'bg-slate-50 border-slate-200 text-slate-400'
                    : 'bg-teal-50/50 border-teal-200/60 text-slate-800'
                }`}
              >
                <div className="font-semibold text-slate-900 mb-0.5">{timing.day}</div>
                {timing.isClosed ? (
                  <span className="text-[11px] font-bold text-rose-500">CLOSED</span>
                ) : (
                  <div className="font-mono text-[10px] text-slate-600">
                    {timing.startTime || timing.openingTime || '-'} – {timing.endTime || timing.closingTime || '-'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
