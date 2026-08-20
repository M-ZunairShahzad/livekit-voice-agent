/**
 * Centralized API Service Module
 * Handles format mapping between Frontend (camelCase) and Backend FastAPI (snake_case).
 */

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

// ─────────────────────────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────────────────────────
const handleResponse = async (res) => {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
};

// ─────────────────────────────────────────────────────────────
// FORMATTERS (Backend snake_case ➔ Frontend camelCase)
// ─────────────────────────────────────────────────────────────
const formatDoctorForFrontend = (doc) => ({
  id: doc.doctor_id,
  fullName: doc.full_name,
  qualification: Array.isArray(doc.qualification) ? doc.qualification.join(', ') : doc.qualification,
  status: doc.status === 'onleave' ? 'On Leave' : (doc.status ? doc.status.charAt(0).toUpperCase() + doc.status.slice(1) : 'Active'),
  specializations: doc.specializations || [],
  availability: (doc.availabilities || []).map((a) => ({
    id: a.availability_id,
    day: a.day_of_week,
    startTime: a.start_time ? a.start_time.slice(0, 5) : '',
    endTime: a.end_time ? a.end_time.slice(0, 5) : '',
  })),
});

const formatLabTestForFrontend = (test) => ({
  id: test.test_id,
  testName: test.test_name,
  price: test.price,
  isAvailable: test.is_available,
});

const formatLabTimingForFrontend = (timing) => ({
  id: timing.timing_id,
  day: timing.day_of_week,
  openingTime: timing.opening_time ? String(timing.opening_time).slice(0, 5) : '',
  closingTime: timing.closing_time ? String(timing.closing_time).slice(0, 5) : '',
  startTime: timing.opening_time ? String(timing.opening_time).slice(0, 5) : '',
  endTime: timing.closing_time ? String(timing.closing_time).slice(0, 5) : '',
  isClosed: timing.is_closed,
});

const formatClinicTimingForFrontend = (timing) => ({
  id: timing.timing_id,
  day: timing.day_of_week,
  openingTime: timing.opening_time ? String(timing.opening_time).slice(0, 5) : '',
  closingTime: timing.closing_time ? String(timing.closing_time).slice(0, 5) : '',
  startTime: timing.opening_time ? String(timing.opening_time).slice(0, 5) : '',
  endTime: timing.closing_time ? String(timing.closing_time).slice(0, 5) : '',
  isClosed: timing.is_closed,
});

const formatFaqForFrontend = (faq) => ({
  id: faq.faq_id,
  question: faq.question,
  answer: faq.answer,
  category: faq.category === 'doctor' ? 'Doctor' : faq.category === 'lab' ? 'Lab' : 'Clinics',
});

// ─────────────────────────────────────────────────────────────
// DOCTOR ENDPOINTS
// ─────────────────────────────────────────────────────────────

export const getDoctors = async () => {
  const res = await fetch(`${BASE_URL}/doctors/`);
  const data = await handleResponse(res);
  return (data || []).map(formatDoctorForFrontend);
};

export const saveDoctorApi = async (doctorData) => {
  // Map "On Leave" -> "onleave", "Active" -> "active", "Inactive" -> "inactive"
  let backendStatus = "active";
  if (doctorData.status === "On Leave" || doctorData.status === "onleave") {
    backendStatus = "onleave";
  } else if (doctorData.status === "Inactive" || doctorData.status === "inactive") {
    backendStatus = "inactive";
  }

  const payload = {
    full_name: doctorData.fullName,
    qualification: Array.isArray(doctorData.qualification) ? doctorData.qualification : [doctorData.qualification],
    status: backendStatus,
    specializations: doctorData.specializations || [],
    availabilities: (doctorData.availability || []).map((slot) => ({
      day_of_week: slot.day,
      start_time: slot.startTime.length === 5 ? `${slot.startTime}:00` : slot.startTime,
      end_time: slot.endTime.length === 5 ? `${slot.endTime}:00` : slot.endTime,
    })),
  };

  const res = await fetch(`${BASE_URL}/doctors/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const savedDoc = await handleResponse(res);
  return formatDoctorForFrontend(savedDoc);
};

export const deleteDoctorApi = async (id) => {
  const res = await fetch(`${BASE_URL}/doctors/${id}`, {
    method: "DELETE",
  });
  return handleResponse(res);
};

// ─────────────────────────────────────────────────────────────
// LAB TEST & TIMINGS ENDPOINTS
// ─────────────────────────────────────────────────────────────

export const getLabData = async () => {
  const [testsRes, timingsRes] = await Promise.all([
    fetch(`${BASE_URL}/lab/test/`),
    fetch(`${BASE_URL}/lab/timings/`),
  ]);
  const tests = await handleResponse(testsRes);
  const schedule = await handleResponse(timingsRes);
  return {
    tests: (tests || []).map(formatLabTestForFrontend),
    labTimings: (schedule?.timings || []).map(formatLabTimingForFrontend),
  };
};

export const saveLabTestApi = async (testData) => {
  const payload = {
    test_name: testData.testName,
    price: parseFloat(testData.price),
    is_available: testData.isAvailable ?? true,
  };

  const res = await fetch(`${BASE_URL}/lab/test/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const savedTest = await handleResponse(res);
  return formatLabTestForFrontend(savedTest);
};

export const deleteLabTestApi = async (id) => {
  const res = await fetch(`${BASE_URL}/lab/test/${id}`, {
    method: "DELETE",
  });
  return handleResponse(res);
};

export const saveLabTimingsApi = async (labTimings) => {
  const payload = {
    timings: labTimings.map((slot) => {
      const open = slot.openingTime || slot.startTime;
      const close = slot.closingTime || slot.endTime;
      return {
        day_of_week: slot.day,
        opening_time: slot.isClosed ? null : (open?.length === 5 ? `${open}:00` : open),
        closing_time: slot.isClosed ? null : (close?.length === 5 ? `${close}:00` : close),
        is_closed: slot.isClosed,
      };
    }),
  };

  const res = await fetch(`${BASE_URL}/lab/timings/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const savedSchedule = await handleResponse(res);
  return (savedSchedule?.timings || []).map(formatLabTimingForFrontend);
};

// ─────────────────────────────────────────────────────────────
// CLINIC ENDPOINTS
// ─────────────────────────────────────────────────────────────

export const getClinicData = async () => {
  const [timingsRes, faqsRes] = await Promise.all([
    fetch(`${BASE_URL}/clinic/timings/`),
    fetch(`${BASE_URL}/faqs/`),
  ]);
  const schedule = await handleResponse(timingsRes);
  const faqData = await handleResponse(faqsRes);
  return {
    clinicTimings: (schedule?.timings || []).map(formatClinicTimingForFrontend),
    faqs: (faqData?.faqs || []).map(formatFaqForFrontend),
  };
};

export const saveClinicTimingsApi = async (clinicTimings) => {
  const payload = {
    timings: clinicTimings.map((slot) => {
      const open = slot.openingTime || slot.startTime;
      const close = slot.closingTime || slot.endTime;
      return {
        day_of_week: slot.day,
        opening_time: slot.isClosed ? null : (open?.length === 5 ? `${open}:00` : open),
        closing_time: slot.isClosed ? null : (close?.length === 5 ? `${close}:00` : close),
        is_closed: slot.isClosed,
      };
    }),
  };

  const res = await fetch(`${BASE_URL}/clinic/timings/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const savedSchedule = await handleResponse(res);
  return (savedSchedule?.timings || []).map(formatClinicTimingForFrontend);
};

export const saveFaqApi = async (faqData) => {
  // Map category to backend enum ("doctor", "lab", "clinics")
  let cat = 'clinics';
  if (faqData.category === 'Doctor' || faqData.category === 'doctor') cat = 'doctor';
  else if (faqData.category === 'Lab' || faqData.category === 'lab') cat = 'lab';

  const payload = {
    faqs: [
      {
        question: faqData.question,
        answer: faqData.answer,
        category: cat,
      }
    ],
  };

  const res = await fetch(`${BASE_URL}/faqs/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const savedFaqs = await handleResponse(res);
  const firstSaved = savedFaqs?.faqs?.[0];
  return firstSaved ? formatFaqForFrontend(firstSaved) : null;
};

export const deleteFaqApi = async (id) => {
  const res = await fetch(`${BASE_URL}/faqs/${id}`, {
    method: "DELETE",
  });
  return handleResponse(res);
};

// ─────────────────────────────────────────────────────────────
// LIVEKIT TOKEN ENDPOINT
// ─────────────────────────────────────────────────────────────

export const getLiveKitTokenApi = async (roomName, participantName) => {
  const params = new URLSearchParams();
  if (roomName) params.append("room_name", roomName);
  if (participantName) params.append("participant_name", participantName);

  const queryString = params.toString();
  const url = `${BASE_URL}/api/token${queryString ? `?${queryString}` : ""}`;
  
  const res = await fetch(url);
  return handleResponse(res);
};

