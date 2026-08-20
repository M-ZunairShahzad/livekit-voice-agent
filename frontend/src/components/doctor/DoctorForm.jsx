import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { RepeatableSchedule } from '../common/RepeatableSchedule';
import { User, Award, Activity, Tag, Plus, X, Check } from 'lucide-react';

export const DoctorForm = ({ onSuccess }) => {
  const { addDoctor } = useClinic();

  // Form State
  const [fullName, setFullName] = useState('');
  const [status, setStatus] = useState('Active');

  // Qualification (Dynamic Tags — list of degree strings)
  const [qualifications, setQualifications] = useState([]);
  const [qualInput, setQualInput] = useState('');

  // Specializations (Dynamic Tags — optional)
  const [specializations, setSpecializations] = useState([]);
  const [tagInput, setTagInput] = useState('');

  // Availability (Repeatable Schedule — mandatory, min 1 slot)
  const [availability, setAvailability] = useState([
    { id: '1', day: 'Monday', startTime: '09:00', endTime: '17:00', isClosed: false },
    { id: '2', day: 'Wednesday', startTime: '09:00', endTime: '17:00', isClosed: false },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availabilityError, setAvailabilityError] = useState(false);

  // ── Qualification Tag Handlers ──────────────────────────────
  const handleAddQual = (e) => {
    e?.preventDefault();
    const trimmed = qualInput.trim();
    if (trimmed && !qualifications.includes(trimmed)) {
      setQualifications([...qualifications, trimmed]);
      setQualInput('');
    }
  };

  const handleRemoveQual = (toRemove) => {
    setQualifications(qualifications.filter((q) => q !== toRemove));
  };

  const handleKeyDownQual = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddQual();
    }
  };

  // ── Specialization Tag Handlers ─────────────────────────────
  const handleAddTag = (e) => {
    e?.preventDefault();
    const trimmed = tagInput.trim();
    if (trimmed && !specializations.includes(trimmed)) {
      setSpecializations([...specializations, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setSpecializations(specializations.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDownTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // ── Availability Change Handler ─────────────────────────────
  const handleAvailabilityChange = (newSlots) => {
    setAvailability(newSlots);
    if (newSlots.length > 0) setAvailabilityError(false);
  };

  // ── Form Submission ─────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Automatically process any typed input if the user forgot to press Enter / click +
    let currentQuals = [...qualifications];
    const trimmedQual = qualInput.trim();
    if (trimmedQual && !currentQuals.includes(trimmedQual)) {
      currentQuals.push(trimmedQual);
      setQualifications(currentQuals);
      setQualInput('');
    }

    let currentSpecs = [...specializations];
    const trimmedSpec = tagInput.trim();
    if (trimmedSpec && !currentSpecs.includes(trimmedSpec)) {
      currentSpecs.push(trimmedSpec);
      setSpecializations(currentSpecs);
      setTagInput('');
    }

    // Validate: full name required
    if (!fullName.trim()) return;

    // Validate: at least one qualification degree
    if (currentQuals.length === 0) return;

    // Validate: availability is mandatory
    if (availability.length === 0) {
      setAvailabilityError(true);
      return;
    }

    setIsSubmitting(true);

    const newDoctorData = {
      fullName: fullName.trim(),
      qualification: currentQuals,   // list[str] — matches backend schema
      status,
      specializations: currentSpecs,
      availability,
    };

    const success = await addDoctor(newDoctorData);

    setIsSubmitting(false);

    if (success) {
      // Reset form
      setFullName('');
      setQualifications([]);
      setQualInput('');
      setStatus('Active');
      setSpecializations([]);
      setTagInput('');
      setAvailability([]);
      setAvailabilityError(false);
      if (onSuccess) onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-lg font-semibold text-slate-900 font-sans">Add Doctor Profile</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Enter physician details, credentials, status, specializations, and weekly consultation availability.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Full Name Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center space-x-1.5">
            <User className="w-3.5 h-3.5 text-teal-600" />
            <span>Doctor's Full Name *</span>
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Dr. Sarah Jenkins"
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
          />
        </div>

        {/* Qualification — Multi-Tag Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center space-x-1.5">
            <Award className="w-3.5 h-3.5 text-teal-600" />
            <span>Qualification *</span>
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={qualInput}
              onChange={(e) => setQualInput(e.target.value)}
              onKeyDown={handleKeyDownQual}
              placeholder="e.g. MBBS, MD (press Enter or +)"
              className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
            />
            <button
              type="button"
              onClick={handleAddQual}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center"
              title="Add qualification"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Qualification Degree Chips */}
          {qualifications.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {qualifications.map((q) => (
                <span
                  key={q}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 text-xs font-medium border border-amber-200/60"
                >
                  <span>{q}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveQual(q)}
                    className="text-amber-600 hover:text-amber-900 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Validation hint */}
          <p className="text-xs text-slate-400 mt-1.5">
            Press <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] text-slate-600">Enter</kbd> or click <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] text-slate-600">+</kbd> to add each degree.
          </p>
        </div>

        {/* Status Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center space-x-1.5">
            <Activity className="w-3.5 h-3.5 text-teal-600" />
            <span>Current Status</span>
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>

        {/* Specializations (Dynamic Tag Creator — Optional) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center space-x-1.5">
            <Tag className="w-3.5 h-3.5 text-teal-600" />
            <span>Specializations</span>
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDownTag}
              placeholder="e.g. Cardiology (press Enter or +)"
              className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center"
              title="Add specialization"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Render Specialization Tag Chips */}
          {specializations.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {specializations.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 text-xs font-medium border border-teal-200/60"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-teal-600 hover:text-teal-900 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <p className="text-xs text-slate-400 mt-1.5">
            Press <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] text-slate-600">Enter</kbd> or click <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] text-slate-600">+</kbd> to add each tag.
          </p>
        </div>
      </div>

      {/* Doctor Repeatable Availability — Mandatory */}
      <div className="pt-2">
        <RepeatableSchedule
          scheduleItems={availability}
          onChange={handleAvailabilityChange}
          showIsClosed={false}
          startLabel="Start Time"
          endLabel="End Time"
          title="Doctor Availability Schedule *"
        />
        {availabilityError && (
          <p className="text-xs text-red-500 mt-2 flex items-center space-x-1">
            <span>⚠</span>
            <span>At least one availability slot is required for every doctor.</span>
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white text-sm font-semibold shadow-sm shadow-teal-600/30 transition-all disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          <span>{isSubmitting ? 'Saving Doctor...' : 'Save Doctor Profile'}</span>
        </button>
      </div>
    </form>
  );
};
