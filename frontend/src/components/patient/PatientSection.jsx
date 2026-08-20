import React, { useEffect, useRef, useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Sparkles,
  PhoneCall,
  Stethoscope,
  FlaskConical,
  Clock,
  HelpCircle,
  Search,
  CheckCircle2,
  Calendar,
  DollarSign,
  ShieldAlert,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import gsap from 'gsap';

export const PatientSection = () => {
  const { doctors, labTests, clinicTimings, faqs, setIsVoiceAssistantOpen } = useClinic();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFaqCategory, setActiveFaqCategory] = useState('All');
  const [expandedFaqId, setExpandedFaqId] = useState(null);

  const heroRef = useRef(null);
  const cardsRef = useRef([]);

  // GSAP staggered entrance animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Card Fade & Slide Up
      gsap.fromTo(
        heroRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }
      );

      // Staggered cards animation
      gsap.fromTo(
        cardsRef.current,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out', delay: 0.2 }
      );
    });

    return () => ctx.revert();
  }, []);

  // Filtered FAQs
  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory =
      activeFaqCategory === 'All' ||
      (activeFaqCategory === 'Doctor' && faq.category === 'Doctor') ||
      (activeFaqCategory === 'Lab' && faq.category === 'Lab') ||
      (activeFaqCategory === 'Clinics' && faq.category === 'Clinics');

    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Filtered Doctors
  const activeDoctors = doctors.filter((doc) => doc.status === 'Active' || doc.status === 'active');

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* 🌟 HERO CARD: AI Voice Assistant Call Prompt */}
      <div
        ref={heroRef}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white p-8 sm:p-10 border border-teal-500/30 shadow-2xl shadow-teal-900/20"
      >
        {/* Animated Background Orbs */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Introducing Zunair - AI Voice Receptionist</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4 leading-tight">
            Instant Healthcare Answers, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-emerald-300 to-cyan-300">
              Powered by Live Voice AI
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 mb-8 leading-relaxed max-w-2xl">
            Have questions about doctor schedules, lab test pricing, or clinic hours? Talk directly to Zunair in natural conversational English.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setIsVoiceAssistantOpen(true)}
              className="px-6 py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-sm sm:text-base rounded-2xl shadow-xl shadow-teal-500/30 hover:shadow-teal-500/40 transition-all duration-200 flex items-center space-x-2.5 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <PhoneCall className="w-5 h-5 fill-slate-950" />
              <span>Talk to Voice Assistant Zunair</span>
            </button>

            <span className="text-xs text-teal-200/80 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              No login required &bull; Real-time Database Search
            </span>
          </div>
        </div>
      </div>

      {/* 📊 PATIENT QUICK SEARCH & SERVICES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Active Doctors */}
        <div
          ref={(el) => (cardsRef.current[0] = el)}
          className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 border border-teal-100">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base">Active Doctors</h3>
              <p className="text-xs text-slate-500">{activeDoctors.length} Specialists Available</p>
            </div>
          </div>

          <div className="space-y-3">
            {activeDoctors.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">No active doctors registered currently.</p>
            ) : (
              activeDoctors.slice(0, 3).map((doc) => (
                <div key={doc.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{doc.fullName}</p>
                    <p className="text-[11px] text-slate-500">{doc.qualification}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                    Active
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Card 2: Lab Test Catalog Preview */}
        <div
          ref={(el) => (cardsRef.current[1] = el)}
          className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base">Lab Test Catalog</h3>
              <p className="text-xs text-slate-500">{labTests.length} Tests Configured</p>
            </div>
          </div>

          <div className="space-y-3">
            {labTests.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">No lab tests available in catalog.</p>
            ) : (
              labTests.slice(0, 3).map((test) => (
                <div key={test.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-800">{test.testName}</span>
                  <span className="text-xs font-bold text-teal-700">PKR {test.price}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Card 3: Clinic Operating Schedule */}
        <div
          ref={(el) => (cardsRef.current[2] = el)}
          className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base">Clinic Operating Hours</h3>
              <p className="text-xs text-slate-500">Weekly Schedule</p>
            </div>
          </div>

          <div className="space-y-2">
            {clinicTimings.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">Clinic timings not configured yet.</p>
            ) : (
              clinicTimings.slice(0, 4).map((timing) => (
                <div key={timing.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                  <span className="font-medium text-slate-700">{timing.day}</span>
                  <span className={timing.isClosed ? 'text-rose-500 font-semibold' : 'text-slate-600'}>
                    {timing.isClosed ? 'Closed' : `${timing.openingTime} - ${timing.closingTime}`}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ❓ HOSPITAL KNOWLEDGE BASE & FAQ ACCORDION */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-teal-600" /> Hospital Knowledge Base & FAQs
            </h2>
            <p className="text-xs text-slate-500">Search frequently asked questions answered by our AI Assistant</p>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center space-x-2 mb-6 border-b border-slate-100 pb-3 overflow-x-auto">
          {['All', 'Doctor', 'Lab', 'Clinics'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFaqCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFaqCategory === cat
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion FAQ Items */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No frequently asked questions found matching your filter.
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isExpanded = expandedFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="rounded-2xl border border-slate-200/70 overflow-hidden bg-slate-50/50 transition-colors hover:bg-slate-50"
                >
                  <button
                    onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between font-medium text-xs sm:text-sm text-slate-900"
                  >
                    <span className="flex items-center space-x-2">
                      <span className="text-teal-600 font-bold">Q:</span>
                      <span>{faq.question}</span>
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      <span className="text-emerald-600 font-bold mr-1">Answer:</span>
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
