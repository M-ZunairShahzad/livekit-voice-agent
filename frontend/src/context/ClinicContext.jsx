import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getDoctors,
  saveDoctorApi,
  deleteDoctorApi,
  getLabData,
  saveLabTestApi,
  saveLabTimingsApi,
  deleteLabTestApi,
  getClinicData,
  saveClinicTimingsApi,
  saveFaqApi,
  deleteFaqApi
} from '../services/api';

const ClinicContext = createContext();

export const ClinicProvider = ({ children }) => {
  // Navigation active tab: 'patient' | 'doctor' | 'lab' | 'clinic'
  const [activeTab, setActiveTab] = useState('patient');

  // Voice Assistant Modal state
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);

  // Section State — initialized clean (No dummy data!)
  const [doctors, setDoctors] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [labTimings, setLabTimings] = useState([]);
  const [clinicTimings, setClinicTimings] = useState([]);
  const [faqs, setFaqs] = useState([]);

  // Toast feedback state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load initial data on mount (Calls API hooks)
  useEffect(() => {
    const initializeData = async () => {
      try {
        // ADD API HERE: Fetch initial data on dashboard load
        const doctorsData = await getDoctors();
        const labData = await getLabData();
        const clinicData = await getClinicData();

        if (doctorsData) setDoctors(doctorsData);
        if (labData?.tests) setLabTests(labData.tests);
        if (labData?.labTimings) setLabTimings(labData.labTimings);
        if (clinicData?.clinicTimings) setClinicTimings(clinicData.clinicTimings);
        if (clinicData?.faqs) setFaqs(clinicData.faqs);
      } catch (err) {
        console.error('Error fetching data from API:', err);
      }
    };
    initializeData();
  }, []);

  // ------------------------------------------
  // Doctor Handlers
  // ------------------------------------------
  const addDoctor = async (doctorData) => {
    try {
      // ADD API HERE: Send new doctor to server API
      const newDoctor = await saveDoctorApi(doctorData);
      setDoctors((prev) => [newDoctor, ...prev]);
      showToast(`Doctor ${newDoctor.fullName} saved successfully!`);
      return true;
    } catch (err) {
      console.error('Error saving doctor:', err);
      showToast('Failed to save doctor details.', 'error');
      return false;
    }
  };

  const removeDoctor = async (id) => {
    try {
      // ADD API HERE: Call delete doctor API
      await deleteDoctorApi(id);
      setDoctors((prev) => prev.filter((doc) => doc.id !== id));
      showToast('Doctor record removed.', 'info');
    } catch (err) {
      console.error('Error removing doctor:', err);
      showToast('Failed to remove doctor.', 'error');
    }
  };

  // ------------------------------------------
  // Lab Handlers
  // ------------------------------------------
  const addLabTest = async (testData) => {
    try {
      // ADD API HERE: Send lab test to backend API
      const newTest = await saveLabTestApi(testData);
      setLabTests((prev) => [newTest, ...prev]);
      showToast(`Lab test "${newTest.testName}" added successfully!`);
      return true;
    } catch (err) {
      console.error('Error saving lab test:', err);
      showToast('Failed to save lab test.', 'error');
      return false;
    }
  };

  const removeLabTest = async (id) => {
    try {
      // ADD API HERE: Call delete lab test API
      await deleteLabTestApi(id);
      setLabTests((prev) => prev.filter((test) => test.id !== id));
      showToast('Lab test removed.', 'info');
    } catch (err) {
      console.error('Error removing lab test:', err);
    }
  };

  const updateLabTimings = async (timings) => {
    try {
      // ADD API HERE: Save lab operating timings to API
      await saveLabTimingsApi(timings);
      setLabTimings(timings);
      showToast('Lab operating timings updated successfully!');
      return true;
    } catch (err) {
      console.error('Error updating lab timings:', err);
      showToast('Failed to update lab timings.', 'error');
      return false;
    }
  };

  // ------------------------------------------
  // Clinic Handlers
  // ------------------------------------------
  const updateClinicTimings = async (timings) => {
    try {
      // ADD API HERE: Save overall clinic operating timings
      await saveClinicTimingsApi(timings);
      setClinicTimings(timings);
      showToast('Clinic schedule updated successfully!');
      return true;
    } catch (err) {
      console.error('Error updating clinic schedule:', err);
      showToast('Failed to update clinic schedule.', 'error');
      return false;
    }
  };

  const addFaq = async (faqData) => {
    try {
      // ADD API HERE: Send FAQ item to backend API
      const newFaq = await saveFaqApi(faqData);
      setFaqs((prev) => [newFaq, ...prev]);
      showToast('FAQ added successfully!');
      return true;
    } catch (err) {
      console.error('Error saving FAQ:', err);
      showToast('Failed to save FAQ.', 'error');
      return false;
    }
  };

  const removeFaq = async (id) => {
    try {
      // ADD API HERE: Delete FAQ from database
      await deleteFaqApi(id);
      setFaqs((prev) => prev.filter((faq) => faq.id !== id));
      showToast('FAQ removed.', 'info');
    } catch (err) {
      console.error('Error removing FAQ:', err);
    }
  };

  return (
    <ClinicContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isVoiceAssistantOpen,
        setIsVoiceAssistantOpen,
        doctors,
        addDoctor,
        removeDoctor,
        labTests,
        labTimings,
        addLabTest,
        removeLabTest,
        updateLabTimings,
        clinicTimings,
        updateClinicTimings,
        faqs,
        addFaq,
        removeFaq,
        toast,
        showToast
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};
