import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { User, Award, Clock, Trash2, Calendar } from 'lucide-react';
import { EmptyState } from '../common/EmptyState';

export const DoctorList = ({ onAddNew }) => {
  const { doctors, removeDoctor } = useClinic();

  if (doctors.length === 0) {
    return (
      <EmptyState
        icon={User}
        title="No Doctors Registered"
        description="There are currently no doctor profiles in the database. Use the form above to add your first physician."
        actionText="Add First Doctor"
        onAction={onAddNew}
      />
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'On Leave':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Inactive':
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800 font-sans uppercase tracking-wider">
          Registered Doctors ({doctors.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {doctors.map((doctor) => (
          <div
            key={doctor.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900 font-sans">{doctor.fullName}</h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center space-x-1">
                    <Award className="w-3.5 h-3.5 text-teal-600 inline" />
                    <span>{doctor.qualification}</span>
                  </p>
                </div>
                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                    doctor.status
                  )}`}
                >
                  {doctor.status}
                </span>
              </div>

              {/* Specializations */}
              {doctor.specializations && doctor.specializations.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {doctor.specializations.map((spec, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              )}

              {/* Availability schedule list */}
              {doctor.availability && doctor.availability.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1 mb-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>Availability</span>
                  </span>
                  {doctor.availability.map((avail, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-slate-600 flex items-center justify-between py-0.5"
                    >
                      <span className="font-medium text-slate-700">{avail.day}:</span>
                      <span className="font-mono text-[11px] text-slate-500 flex items-center">
                        <Clock className="w-3 h-3 text-slate-400 mr-1" />
                        {avail.startTime} – {avail.endTime}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  // ==========================================
                  // ADD API HERE: Trigger doctor delete API call
                  // Example: await deleteDoctorApi(doctor.id);
                  // ==========================================
                  removeDoctor(doctor.id);
                }}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium inline-flex items-center space-x-1 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Doctor</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
