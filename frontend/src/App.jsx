import React from 'react';
import { ClinicProvider, useClinic } from './context/ClinicContext';
import { Header } from './components/common/Header';
import { Toast } from './components/common/Toast';
import { VoiceAssistantModal } from './components/common/VoiceAssistantModal';
import { PatientSection } from './components/patient/PatientSection';
import { DoctorSection } from './components/doctor/DoctorSection';
import { LabSection } from './components/lab/LabSection';
import { ClinicSection } from './components/clinic/ClinicSection';

const MainDashboardContent = () => {
  const { activeTab, toast, setToast } = useClinic();

  // Dynamic Full Page Background Image per Section
  const getSectionBgImage = () => {
    switch (activeTab) {
      case 'patient':
        return '/images/clinic.jpg';
      case 'doctor':
        return '/images/doctor.jpg';
      case 'lab':
        return '/images/lab.jpg';
      case 'clinic':
        return '/images/clinic.jpg';
      default:
        return '/images/clinic.jpg';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative overflow-x-hidden">
      {/* Whole Page Background Image Layer spanning full screen width & height */}
      <div
        className="fixed inset-0 bg-cover bg-center pointer-events-none opacity-12 mix-blend-multiply transition-all duration-500 z-0"
        style={{ backgroundImage: `url('${getSectionBgImage()}')` }}
      />

      {/* Top Header Navigation */}
      <Header />

      {/* Main Centered Content Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {activeTab === 'patient' && <PatientSection />}
        {activeTab === 'doctor' && <DoctorSection />}
        {activeTab === 'lab' && <LabSection />}
        {activeTab === 'clinic' && <ClinicSection />}
      </main>

      {/* Footer */}
      <footer className="bg-white/90 backdrop-blur-md border-t border-slate-200/80 py-5 text-center text-xs text-slate-500 relative z-10">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div>
            <span className="font-semibold text-slate-700">Mid City Hospital Data & AI System</span> &copy; {new Date().getFullYear()}
          </div>
          <div className="text-[11px] text-slate-400">
            LiveKit WebRTC &bull; FastAPI Backend
          </div>
        </div>
      </footer>

      {/* LiveKit Voice Assistant Glassmorphic Modal */}
      <VoiceAssistantModal />

      {/* Toast Feedback Popup */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default function App() {
  return (
    <ClinicProvider>
      <MainDashboardContent />
    </ClinicProvider>
  );
}
