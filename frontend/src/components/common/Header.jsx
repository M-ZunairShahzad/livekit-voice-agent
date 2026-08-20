import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { UserCheck, FlaskConical, Building2, Stethoscope, HeartHandshake, PhoneCall } from 'lucide-react';

export const Header = () => {
  const { activeTab, setActiveTab, doctors, labTests, faqs, setIsVoiceAssistantOpen } = useClinic();

  const navItems = [
    {
      id: 'patient',
      label: 'Patient Portal',
      icon: HeartHandshake,
      badge: 'Live AI',
    },
    {
      id: 'doctor',
      label: 'Doctor Section',
      icon: UserCheck,
      count: doctors.length,
    },
    {
      id: 'lab',
      label: 'Lab Section',
      icon: FlaskConical,
      count: labTests.length,
    },
    {
      id: 'clinic',
      label: 'Clinic Section',
      icon: Building2,
      count: faqs.length,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('patient')}>
            <div className="h-9 w-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-600/30">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <span className="font-semibold text-lg tracking-tight text-slate-900 font-sans">
                Mid City <span className="text-teal-600 font-normal">Hospital</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-medium border border-teal-200">
                Voice AI Portal
              </span>
            </div>
          </div>

          {/* Centered Top Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/70 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.2 rounded-full bg-teal-600 text-white">
                      {item.badge}
                    </span>
                  )}
                  {item.count > 0 && (
                    <span
                      className={`ml-1 text-[11px] font-semibold px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? 'bg-teal-100 text-teal-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Top Header "Call Voice Assistant" Action Button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsVoiceAssistantOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-medium text-xs sm:text-sm rounded-xl shadow-md shadow-teal-600/20 hover:shadow-teal-600/30 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <PhoneCall className="w-4 h-4 animate-bounce" />
              <span className="hidden sm:inline">Call Voice Assistant</span>
              <span className="sm:hidden">Call AI</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
