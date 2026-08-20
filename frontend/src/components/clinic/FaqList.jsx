import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { HelpCircle, Trash2, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { EmptyState } from '../common/EmptyState';

export const FaqList = () => {
  const { faqs, removeFaq, clinicTimings } = useClinic();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [openFaqId, setOpenFaqId] = useState(null);

  const categories = ['All', 'Doctor', 'Lab', 'Clinics'];

  const filteredFaqs =
    selectedCategory === 'All'
      ? faqs
      : faqs.filter((faq) => faq.category === selectedCategory);

  const toggleFaqAccordion = (id) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Overview Card for Clinic Timings Schedule */}
      {clinicTimings && clinicTimings.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-3">
            Current Clinic Operating Schedule
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {clinicTimings.map((timing, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-xl border text-center text-xs ${
                  timing.isClosed
                    ? 'bg-slate-50 border-slate-200 text-slate-400'
                    : 'bg-emerald-50/50 border-emerald-200/60 text-slate-800'
                }`}
              >
                <div className="font-semibold text-slate-900 mb-0.5">{timing.day}</div>
                {timing.isClosed ? (
                  <span className="text-[11px] font-bold text-rose-500">CLOSED</span>
                ) : (
                  <div className="font-mono text-[10px] text-slate-600">
                    {timing.startTime} – {timing.endTime}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Saved FAQs Display */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-sm font-semibold text-slate-800 font-sans uppercase tracking-wider">
            Categorized Knowledge Base FAQs ({faqs.length})
          </h3>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-white text-slate-900 shadow-sm font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filteredFaqs.length === 0 ? (
          <EmptyState
            icon={HelpCircle}
            title="No FAQs Configured"
            description={
              selectedCategory === 'All'
                ? 'No questions have been added yet. Use the FAQ form above to publish patient guidance.'
                : `No FAQs found under the "${selectedCategory}" category.`
            }
          />
        ) : (
          <div className="space-y-3">
            {filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm transition-all"
                >
                  <div
                    onClick={() => toggleFaqAccordion(faq.id)}
                    className="p-4 cursor-pointer flex items-center justify-between hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="flex items-center space-x-3 flex-1 pr-4">
                      <span className="text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-md flex items-center space-x-1">
                        <Tag className="w-3 h-3 text-teal-600" />
                        <span>{faq.category}</span>
                      </span>
                      <h4 className="text-sm font-semibold text-slate-900 font-sans">
                        {faq.question}
                      </h4>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          // ==========================================
                          // ADD API HERE: Call delete FAQ API hook
                          // Example: await deleteFaqApi(faq.id);
                          // ==========================================
                          removeFaq(faq.id);
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete FAQ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-100 text-xs text-slate-600 leading-relaxed bg-slate-50/40">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
