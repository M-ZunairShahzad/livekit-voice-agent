import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { HelpCircle, Folder, Plus, Trash2, Check } from 'lucide-react';

export const FaqForm = () => {
  const { addFaq } = useClinic();

  // Dynamic repeatable FAQ items list
  const [faqItems, setFaqItems] = useState([
    {
      id: Date.now().toString(),
      question: '',
      answer: '',
      category: 'Clinics',
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddRow = () => {
    setFaqItems([
      ...faqItems,
      {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
        question: '',
        answer: '',
        category: 'Doctor',
      },
    ]);
  };

  const handleRemoveRow = (id) => {
    if (faqItems.length === 1) {
      setFaqItems([{ id: Date.now().toString(), question: '', answer: '', category: 'Clinics' }]);
      return;
    }
    setFaqItems(faqItems.filter((item) => item.id !== id));
  };

  const handleUpdateItem = (id, field, value) => {
    setFaqItems(
      faqItems.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Filter valid items with question and answer
    const validItems = faqItems.filter((item) => item.question.trim() && item.answer.trim());
    if (validItems.length === 0) return;

    setIsSubmitting(true);

    let allSaved = true;
    for (const item of validItems) {
      const faqData = {
        question: item.question.trim(),
        answer: item.answer.trim(),
        category: item.category,
      };

      // ==========================================
      // ADD API HERE: Save each FAQ item to database endpoint
      // Example: const res = await fetch('/api/clinic/faqs', { method: 'POST', body: JSON.stringify(faqData) });
      // ==========================================
      const success = await addFaq(faqData);
      if (!success) allSaved = false;
    }

    setIsSubmitting(false);

    if (allSaved) {
      // Reset form to 1 blank row
      setFaqItems([{ id: Date.now().toString(), question: '', answer: '', category: 'Clinics' }]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
      <div className="border-b border-slate-100 pb-3.5 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
              <HelpCircle className="w-4 h-4" />
            </span>
            <h2 className="text-base font-semibold text-slate-900 font-sans">Frequently Asked Questions (FAQs)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Add repeatable questions, detailed answers, and assign to category dropdown [Doctor, Lab, Clinics].
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddRow}
          className="inline-flex items-center space-x-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-xl transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add FAQ Row</span>
        </button>
      </div>

      {/* Repeatable FAQ Rows */}
      <div className="space-y-4">
        {faqItems.map((item, idx) => (
          <div
            key={item.id}
            className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3 relative group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                FAQ #{idx + 1}
              </span>
              {faqItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveRow(item.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Remove FAQ row"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Question Text */}
              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Question *
                </label>
                <input
                  type="text"
                  required
                  value={item.question}
                  onChange={(e) => handleUpdateItem(item.id, 'question', e.target.value)}
                  placeholder="e.g. What should I prepare before a fasting blood test?"
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              {/* Category Dropdown: [Doctor, Lab, Clinics] */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center space-x-1">
                  <Folder className="w-3 h-3 text-teal-600" />
                  <span>Category Dropdown *</span>
                </label>
                <select
                  value={item.category}
                  onChange={(e) => handleUpdateItem(item.id, 'category', e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                >
                  <option value="Doctor">Doctor</option>
                  <option value="Lab">Lab</option>
                  <option value="Clinics">Clinics</option>
                </select>
              </div>
            </div>

            {/* Answer Text Area */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Answer *
              </label>
              <textarea
                rows={2}
                required
                value={item.answer}
                onChange={(e) => handleUpdateItem(item.id, 'answer', e.target.value)}
                placeholder="Provide clear, patient-friendly guidance..."
                className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-all shadow-sm disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          <span>{isSubmitting ? 'Saving FAQs...' : 'Save All FAQs'}</span>
        </button>
      </div>
    </form>
  );
};
