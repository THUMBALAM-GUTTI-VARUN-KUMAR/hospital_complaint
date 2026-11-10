# CAREVOICE

Public Hospital Grievance Registration and Monitoring System.

Backend Development – Python, FastAPI and Supabase.

---

## Frontend Overview (`frontend` branch)

CareVoice is an AI-powered public hospital grievance registration and monitoring system designed for government hospitals.
Citizens can register complaints through two channels:
1. **Web Portal Interface** (Voice recognition & manual text input)
2. **AI Telephone Voice Agent (IVR)** (Dial-in 24/7 helpline)

### Tech Stack
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4 (Coinbase-inspired minimalist government-service design)
- **Routing**: React Router v7
- **HTTP Client**: Axios (Proxying to `http://localhost:8000`)
- **Icons**: Lucide React
- **Speech Recognition**: Browser Web Speech API with fallback for Kannada (`kn-IN`) and English (`en-IN`)

---

## Quick Start Instructions

### 1. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 2. Start Frontend Dev Server
```bash
npm run dev
# or
pnpm run dev
```
The frontend will be running at:
👉 **`http://localhost:5173`**

### 3. Start Backend Server (Port 8000)
Run your FastAPI backend:
```bash
uvicorn main:app --reload --port 8000
```

*(Note: A reference/test FastAPI server `mock_backend.py` is included for testing the API contract before teammate integration)*:
```bash
python mock_backend.py
```

### 4. Build for Production
```bash
npm run build
```

---

## Implemented Modules

- **Module 1: Patient Home Page (`/`)**
  - Bilingual interface (English & ಕನ್ನಡ)
  - Hero section with clear citizen language
  - AI Telephone Voice Helpline card (`1800-203-2273`)
  - Fast-action buttons: *Register a Grievance* & *Track Status*
  - Hospital service category directory

- **Module 2: Complaint Registration (`/register`)**
  - Speech-to-Text using Web Speech API (with support for Kannada `kn-IN` & English `en-IN`)
  - Graceful fallback when microphone is unavailable
  - Real-time recognized text display and inline editing
  - Category selector & automatic department assignment
  - Patient Confirmation Modal before submission
  - Direct `POST /api/complaints` submission
  - Success screen displaying generated Complaint ID with copy button & tracking link

- **Module 3: Complaint Tracking (`/track`)**
  - Complaint ID search input
  - Real-time `GET /api/complaints/{complaint_id}` fetch
  - Displays category, department, registration date, status badge, source (Web vs Voice call)
  - Resolution timeline progress
  - Printable receipt

- **Module 4: Hospital Admin Dashboard (`/dashboard`)**
  - Metric KPI cards: *Total*, *Submitted*, *Pending*, *In Progress*, *Resolved*
  - Search by Complaint ID or issue summary
  - Filter by Category, Source (`Web` vs `Voice call`), and Status
  - Staff modal to inspect complaints, reassign departments, and update status via `PATCH /api/complaints/{complaint_id}/status`

- **Module 5: Minimalist Design & Accessibility**
  - Clean white canvas (`#ffffff`), signature blue CTA pills (`#0052ff`), subtle hairline dividers (`#dee1e6`)
  - High-contrast accessible typography (Inter) and tabular mono for IDs (JetBrains Mono)
  - Full mobile responsiveness
