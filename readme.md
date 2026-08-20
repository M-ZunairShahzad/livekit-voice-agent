# Mid City Hospital AI Voice Agent System

## Project Overview

A complete voice-based healthcare consultation system for Mid City Hospital. The system has two main parts:

1. **Patient Side** - Patients can call a voice agent via WebRTC to get information about doctors, lab tests, clinic timings, and FAQs.
2. **Hospital Side** - Hospital staff (doctors, lab workers, clinic administrators) can manage their respective sections.

Currently, all sections (patient voice agent, doctor section, lab section, clinic section) are visible together. No signup page has been implemented yet as the core focus was building a full hands-on voice agent using LiveKit.

---

## System Architecture

### High-Level Flow

```
Patient → React Frontend → Backend (Token) → LiveKit Server → Worker (Voice Agent) → Patient
```

### Detailed Call Flow

1. Patient opens website and clicks "Call Voice Assistant" button
2. React frontend requests token from FastAPI backend (`GET /api/token`)
3. Backend generates LiveKit JWT access token
4. Frontend uses token to join LiveKit room via WebRTC
5. LiveKit server detects patient in room and creates a job
6. LiveKit sends job to worker (Python client)
7. Worker prewarms (loads VAD model)
8. Voice agent starts and connects to LiveKit room
9. Agent greets patient and conversation begins

---

## Voice Agent Pipeline

The voice agent processes audio through the following pipeline:

### 1. VAD (Voice Activity Detection)

- **Library:** Silero
- **Purpose:** Detects when the person is speaking and when silent
- **Model:** `silero.VAD.load()`
- **Loading:** Prewarmed before the job starts for faster startup

### 2. STT (Speech-to-Text)

- **Provider:** Deepgram
- **Model:** `nova-3-general`
- **Purpose:** Converts patient's speech to text

### 3. LLM (Large Language Model)

- **Provider:** Google Gemini or Groq
- **Model:** `gemini-2.5-flash` or `openai/gpt-oss-20b`
- **Purpose:** Processes text and generates an appropriate response
- **Tool Calling:** Supports function calling to fetch data from the backend

### 4. TTS (Text-to-Speech)

- **Provider:** Deepgram
- **Model:** `aura-asteria-en`
- **Purpose:** Converts LLM text response to speech

### 5. Turn Detection

- **Purpose:** Determines who can speak (agent or patient)
- **Implementation:** `TurnHandlingOptions()`

---

## Backend APIs (FastAPI)

### Token Generation Endpoint

- **Endpoint:** `GET /api/token`
- **Purpose:** Generates LiveKit JWT access token for frontend
- **Parameters:**
  - `room_name` (optional, default: `clinic-room`)
  - `participant_name` (optional, default: `patient`)
- **Returns:** JSON with token, URL, room_name, participant_name

### Doctor APIs

- `POST /doctors/` - Add new doctor
- `GET /doctors/` - Get all doctors
- Doctor fields: `full_name`, `qualification`, `status`, `specialization`

### Lab APIs

- `POST /lab/test/` - Add new lab test
- `GET /lab/test/` - Get all lab tests
- `POST /lab/timings/` - Add lab timings
- `GET /lab/timings/` - Get lab timings
- Lab test fields: `test_name`, `price`, `is_available`, `description`

### Clinic APIs

- `POST /clinic/timings/` - Add clinic timings
- `GET /clinic/timings/` - Get clinic timings
- `POST /faqs/` - Add FAQ
- `GET /faqs/` - Get FAQs
- FAQ fields: `question`, `answer`, `category` (`doctor`/`lab`/`clinics`)

---

## Database Schema (Neon PostgreSQL)

### Tables

1. **doctors** - Doctor information
2. **specializations** - Doctor specializations
3. **doctor_specializations** - Junction table (many-to-many)
4. **doctor_availability** - Doctor weekly timings
5. **lab_tests** - Lab test catalog with prices
6. **lab_timings** - Lab operating hours
7. **clinic_timings** - Clinic operating hours
8. **faqs** - Frequently asked questions

### ENUM Types

- `doctor_status`: `active`, `inactive`, `onleave`
- `faq_category`: `doctor`, `lab`, `clinics`

---

## Tools (Voice Agent Function Calling)

The voice agent uses these tools to fetch data from the backend.

### ClinicTools

- `get_clinic_operational_timings` - Fetch clinic weekly schedule
- `get_clinic_faqs` - Fetch FAQs from the clinic database

### DoctorTools

- `get_doctor_info` - Fetch all registered doctors

### LabTools

- `get_lab_test_catalog` - Fetch available lab tests and prices
- `get_lab_operational_timings` - Fetch lab operating hours

All tools use a shared `httpx.AsyncClient` for efficient connection pooling.

---

## Frontend (React + Vite)

### Components

- **VoiceAssistantModal** - Modal with call button, audio visualizer, mute/unmute, and end call
- **DoctorSection** - Doctors can add their details (name, qualification, specialization, timings)
- **LabSection** - Lab workers can add tests (name, price, timings)
- **ClinicSection** - Clinic administrators can add timings and FAQs
- **PatientSection** - Patient consultation interface

### WebRTC Implementation

The frontend uses LiveKit's `livekit-client` library for WebRTC connection:

1. Fetch token from backend
2. Create LiveKit Room object
3. Connect to the room
4. WebRTC handles audio streaming
5. Enable microphone
6. Receive audio from the agent

---

## Environment Variables (`.env`)

```env
LIVEKIT_URL=wss://your-livekit-cloud-url
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
DEEPGRAM_API_KEY=your-deepgram-key
GROQ_API_KEY=your-groq-key
GOOGLE_API_KEY=your-google-key
BACKEND_URL=http://localhost:8000
```

---

## Installation

### Backend Dependencies

```txt
livekit-agents==1.6.10
livekit-plugins-deepgram==1.6.10
livekit-plugins-google==1.6.10
livekit-plugins-groq==1.6.10
livekit-plugins-silero==1.6.10
httpx==0.28.1
requests==2.34.2
fastapi
uvicorn
```

### Frontend Dependencies

```txt
@livekit/components-react
livekit-client
react
vite
```

---

## Running the System

### 1. Start Backend Server

```bash
uvicorn backend.main:app --reload
```

### 2. Start Voice Agent Worker

```bash
python -m backend.voice_agent.agent dev
```

### 3. Start Frontend

```bash
npm run dev
```

---

# Current Limitations

The initial LiveKit-based implementation works as a proof of concept, but several major limitations were discovered when testing the system from Pakistan. These limitations make the current architecture unsuitable for a production-quality voice agent for Pakistani users.

## 1. Free API Keys Are Not Suitable for Production Voice Agents

Free API keys and free-tier limits are useful for experimentation and development, but they are not reliable enough for a real-time healthcare voice agent.

A voice agent requires multiple services to work together in real time:

- Speech-to-Text (STT)
- LLM processing
- Text-to-Speech (TTS)
- Voice streaming
- WebRTC communication
- Backend tool/function calls

Even if each individual service provides a free tier, the combined latency, rate limits, request limits, token limits, and service restrictions can make the overall voice experience unreliable.

For a healthcare voice assistant, the system needs fast and consistent responses rather than occasional successful responses. Therefore, relying entirely on free API keys is not a suitable long-term solution.

---

## 2. Deepgram Credits Do Not Solve the Latency Problem

Deepgram provides credits for testing, including a significant amount of free credit, but having free credits does not necessarily solve the geographical latency problem.

The Deepgram STT and TTS services were tested as part of the voice pipeline. The problem observed was that the relevant Deepgram infrastructure/processing regions are primarily located around:

- North America
- Europe
- Australia

For a user located in Pakistan, the audio and processing requests therefore have to travel a considerable distance.

This creates additional latency in both directions:

```text
Patient's Voice
      ↓
Pakistan
      ↓
Deepgram Region
      ↓
STT Processing
      ↓
LLM
      ↓
TTS Processing
      ↓
Deepgram Region
      ↓
Pakistan
      ↓
Patient
```

During testing, the system sometimes produced errors indicating that the operation was taking too long.

The problem is therefore not simply the amount of Deepgram credit available. The bigger issue is the **real-time latency introduced by geographical distance and the complete STT → LLM → TTS pipeline**.

For a normal API request, a few seconds of delay might be acceptable. For a conversational voice agent, however, even a relatively small delay can make the conversation feel unnatural.

---

## 3. LiveKit Cloud Has Significant Latency for Pakistani Users

LiveKit Cloud provides regional infrastructure, and the nearest available LiveKit Cloud region to Pakistan is in West India.

Although West India is geographically closer to Pakistan than regions in Europe, North America, or Australia, testing still showed significant latency.

The voice agent sometimes takes too long to respond.

The overall flow becomes:

```text
Patient in Pakistan
        ↓
LiveKit
        ↓
West India Region
        ↓
Voice Agent Worker
        ↓
STT
        ↓
LLM
        ↓
TTS
        ↓
LiveKit
        ↓
Patient in Pakistan
```

Each additional network hop and processing stage contributes to the total response time.

### Audio Quality Problem

Another major problem observed during testing was voice/audio distortion.

Even when the agent successfully responded, the returned audio could sometimes sound distorted or incomplete.

The experience was similar to being on a phone call while traveling on a road with poor network coverage:

> The other person can hear some words, but not all of them clearly.

In the voice-agent implementation, this manifested as:

- Missing portions of speech
- Distorted agent audio
- Audio interruptions
- Words being dropped
- Delayed responses
- Unnatural pauses
- Inconsistent voice quality

This is especially problematic for a healthcare system because patients need to clearly understand information such as:

- Doctor names
- Doctor specializations
- Clinic timings
- Lab test names
- Lab prices
- Instructions
- Frequently asked questions

A voice agent that occasionally loses words or produces distorted speech cannot provide a reliable healthcare experience.

---

## 4. Plivo Is Not Suitable for Pakistan in This Use Case

Plivo was investigated as a possible solution for connecting the voice agent to traditional telephone numbers through SIP/telephony infrastructure.

Plivo provides free credits for testing in some regions, including a small amount of promotional credit.

However, the major problem is regional availability.

Plivo does not provide the required virtual phone number/SIP functionality for Pakistan in the way needed for this project.

Therefore, even if the platform provides free credits, those credits are not useful if the required Pakistani telephone infrastructure is unavailable.

The intended architecture would have been:

```text
Patient Phone
      ↓
Pakistani Phone Number
      ↓
Plivo
      ↓
SIP Trunk
      ↓
Voice Agent
```

But because the required Pakistani number/SIP availability is not present, this approach cannot be reliably implemented for Pakistani patients.

---

## 5. Twilio Free Trial Is Not Available in Pakistan

Twilio was also investigated as another possible telephony provider.

Twilio normally provides trial credits for new accounts, which can be useful for testing voice applications.

However, during account setup/testing from Pakistan, Twilio displays the following restriction:

```text
Trials are currently unavailable in Pakistan

Twilio doesn't offer free trials in your region.

Upgrade to continue building or switch to another account.
```

Therefore, although Twilio provides trial credits in supported countries, those free trial credits cannot be used in the same way for a new Pakistani account.

This makes Twilio less practical for the initial development and testing stage of this project.

---

## 6. Bird.com Has Limited Support for Pakistan

Bird.com was also investigated as a possible communication/telephony solution.

The platform provides SMS functionality for Pakistani users, but the required virtual phone number infrastructure is not available for Pakistan.

This creates another problem for the planned telephone voice-agent architecture.

The desired system requires a real telephone number that can receive patient calls and route those calls into the voice-agent system.

However, because virtual phone numbers are not available for Pakistan through the required setup, Bird.com cannot solve the core problem.

---

## 7. PTA and Pakistani Telecom Restrictions

Another important limitation is the Pakistani telecommunications environment.

The problem is not only which voice-AI provider is selected.

The complete system requires:

- A telephone number
- Voice calling
- SIP connectivity
- Inbound calls
- Outbound calls where required
- SIP trunking
- Virtual number support
- Routing into the AI voice agent

Because of regulatory and telecom restrictions in Pakistan, international voice platforms cannot always provide Pakistani virtual numbers in the same way they provide numbers in countries such as the United States, India, or parts of Europe.

This significantly reduces the number of simple plug-and-play options available for building a traditional phone-based AI voice agent.

---

# Overall Problem With the LiveKit Architecture

The main problem is not that LiveKit itself is a bad technology.

LiveKit is a powerful real-time communication platform.

The problem is that the combination of:

- Pakistani user location
- LiveKit Cloud regional availability
- STT geographical location
- TTS geographical location
- LLM geographical location
- Internet routing
- WebRTC
- Audio encoding/decoding
- Multiple network hops

creates too much end-to-end latency for the desired experience.

The system is therefore technically functional but not sufficiently reliable or responsive for the intended Pakistani healthcare use case.

The architecture was more suitable for users located closer to the available infrastructure.

---

# Recommended Solution

## Move Away From the Current LiveKit-Based Voice Architecture

For this project, the current recommendation is:

> **Do not continue using LiveKit as the primary voice-agent platform for Pakistani users.**

LiveKit can still be useful for experimentation and for regions where users are geographically close to the available infrastructure.

However, the current testing indicates that it is not providing the desired real-time voice experience for users in Pakistan.

The problem is especially noticeable because voice conversations are extremely sensitive to latency.

---

# Recommended Voice Agent Platform: Vapi

The recommended alternative is to investigate and use **Vapi** as the primary voice-agent platform.

Vapi is designed specifically for building AI voice agents and provides a higher-level abstraction over many of the components that currently have to be manually connected in the LiveKit architecture.

Instead of manually managing the complete pipeline:

```text
Frontend
   ↓
FastAPI
   ↓
LiveKit Token
   ↓
LiveKit Room
   ↓
Voice Agent Worker
   ↓
VAD
   ↓
STT
   ↓
LLM
   ↓
TTS
   ↓
LiveKit
   ↓
Frontend
```

the architecture can be simplified to:

```text
Patient
   ↓
Vapi Voice Agent
   ↓
STT
   ↓
LLM
   ↓
Tools / Backend APIs
   ↓
TTS
   ↓
Patient
```

Vapi is focused specifically on voice-agent development, which makes it more suitable for rapidly testing different STT, LLM, and TTS providers without rebuilding the entire communication layer.

---

# Proposed Vapi Architecture

```text
                         ┌──────────────────────┐
                         │    Patient/User      │
                         │      in Pakistan     │
                         └──────────┬───────────┘
                                    │
                                    │ Voice
                                    ↓
                         ┌──────────────────────┐
                         │         Vapi         │
                         │    Voice Platform    │
                         └──────────┬───────────┘
                                    │
                 ┌──────────────────┼──────────────────┐
                 │                  │                  │
                 ↓                  ↓                  ↓
              STT                 LLM                TTS
                 │                  │                  │
                 └──────────────────┼──────────────────┘
                                    │
                                    ↓
                         ┌──────────────────────┐
                         │   Backend / Tools    │
                         │      FastAPI         │
                         └──────────┬───────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ↓               ↓               ↓
                 Doctors           Lab            Clinic
                    │               │               │
                    └───────────────┼───────────────┘
                                    ↓
                              PostgreSQL
```

---

# Why Vapi Is the Recommended Next Step

Vapi is preferable for the next stage because it allows the project to focus on the actual voice-agent experience instead of manually maintaining the complete real-time communication infrastructure.

The main benefits to investigate are:

1. Voice-agent-specific architecture
2. Easier integration of different STT providers
3. Easier integration of different TTS providers
4. Easier integration of different LLM providers
5. Function/tool calling
6. Web-based voice interaction
7. Telephony integration options
8. Faster experimentation
9. Less custom real-time audio infrastructure
10. Easier provider switching when one provider has latency problems

---

# Important Consideration About "Free"

Although Vapi may provide a free or development-friendly option, the system should not assume that an entirely free production voice-agent infrastructure will remain sufficient.

The goal should be:

> **Use the free/development tier to build and test the complete system, then select the most suitable paid providers based on latency, availability, reliability, and cost in Pakistan.**

The most important metric is not simply whether a service is free.

The important metrics are:

- Latency
- Audio quality
- STT accuracy
- TTS quality
- Reliability
- Pakistani accessibility
- Regional infrastructure
- Cost per minute
- Concurrent call support
- Telephony availability
- SIP support
- API reliability

---

# Revised System Direction

The project should therefore move from:

```text
React
   ↓
FastAPI
   ↓
LiveKit
   ↓
Python Voice Agent
   ↓
Silero VAD
   ↓
Deepgram STT
   ↓
Gemini/Groq
   ↓
Deepgram TTS
```

to a more flexible architecture:

```text
React / Web Interface
        ↓
      Vapi
        ↓
 ┌──────┼──────┐
 ↓      ↓      ↓
STT    LLM    TTS
        ↓
   Tool Calling
        ↓
     FastAPI
        ↓
   PostgreSQL
```

The backend APIs and database can remain largely unchanged.

The major change is replacing the LiveKit-based custom voice-agent layer with a Vapi-based voice-agent architecture.
