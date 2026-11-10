# CAREVOICE

> **Public Hospital Grievance Registration and Monitoring System**
> An omni-channel, full-stack hospital grievance redressal platform combining a modern **React 19** citizen portal with a high-performance **FastAPI** backend powered by **Supabase PostgreSQL**.

---

## 🏥 System Overview

CAREVOICE is an automated grievance redressal system designed for public and government hospitals. Citizens and patients can register complaints through two primary channels:
1. **Web Portal Interface:** Bilingual (English & ಕನ್ನಡ) citizen portal with voice dictation (Web Speech API) and manual text intake.
2. **AI Telephone Voice Helpline (IVR):** 24/7 dial-in helpline accepting complaints with call recording URLs and speech-to-text transcripts.

The backend provides complete grievance lifecycle management: sequential complaint ID generation (`CV-YYYY-0001`), department routing, officer assignment, status workflow progression, audit trail logging, citizen feedback collection, and real-time dashboard analytics.

---

## 🛠️ Full-Stack Tech Stack

### Frontend
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS v4 (minimalist government-service design)
- **Routing:** React Router v7
- **HTTP Client:** Axios (configured to proxy to backend at `http://localhost:8000`)
- **Speech Recognition:** Browser Web Speech API with dual language support for Kannada (`kn-IN`) and English (`en-IN`)
- **Icons:** Lucide React

### Backend
- **Framework:** FastAPI (Python 3.11)
- **ASGI Server:** Uvicorn
- **ORM:** SQLAlchemy 2.0
- **Database:** Supabase PostgreSQL (PostgreSQL 17)
- **Validation & Serialization:** Pydantic v2
- **Testing:** Pytest & HTTPX
- **Environment Management:** Python-dotenv

---

## 📁 Repository Structure

```text
hospital_complaint/
├── .env.example              # Backend environment variables template
├── .env                      # Local secrets (never commit)
├── .gitignore                # Unified Git ignore configuration
├── index.html                # Frontend HTML entrypoint
├── package.json              # Frontend npm dependencies & scripts
├── pnpm-lock.yaml            # Frontend lockfile
├── vite.config.js            # Vite configuration
├── requirements.txt          # Python backend dependencies
├── README.md                 # Full-stack documentation
│
├── src/                      # Frontend Source (React 19)
│   ├── assets/               # Static icons & hero graphics
│   ├── components/           # Navbar, Footer, VoiceRecorder, Modals, Badges
│   ├── context/              # AuthContext & LanguageContext
│   ├── pages/                # HomePage, RegisterPage, TrackPage, DashboardPage, LoginPage
│   ├── services/             # Axios API client
│   └── translations.js       # English & Kannada dictionary
│
├── app/                      # Backend Source (FastAPI)
│   ├── __init__.py
│   ├── main.py               # FastAPI entrypoint, CORS & documentation routes
│   ├── database.py           # SQLAlchemy engine & session management
│   ├── models.py             # ORM models: Complaints, ComplaintHistory, Feedback
│   ├── schemas.py            # Pydantic validation schemas
│   ├── services.py           # ID generator (CV-YYYY-0001) & history logging
│   └── routers/
│       ├── __init__.py
│       ├── complaints.py     # Grievance registration, filter & workflow APIs
│       ├── dashboard.py      # Analytics & KPI statistics APIs
│       └── feedback.py       # Patient review & feedback APIs
│
└── tests/                    # Automated Backend Tests
    ├── __init__.py
    ├── conftest.py           # Test fixtures & isolated in-memory DB
    ├── test_complaints.py    # Complaint lifecycle tests
    ├── test_dashboard.py     # Analytics KPI tests
    └── test_feedback.py      # Patient feedback tests
```

---

## 🚀 Quick Start Guide

### 1. Backend Setup & Run (Port 8000)

1. **Activate Virtual Environment:**
   - Windows (PowerShell):
     ```powershell
     .\.venv\Scripts\Activate.ps1
     ```
   - Linux / macOS:
     ```bash
     source .venv/bin/activate
     ```

2. **Install Python Dependencies:**
   ```powershell
   pip install -r requirements.txt
   ```

3. **Configure Environment:**
   Copy `.env.example` to `.env`:
   ```powershell
   Copy-Item .env.example .env
   ```
   Set your Supabase PostgreSQL connection string in `.env`:
   ```env
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173
   ```

4. **Start the FastAPI Backend:**
   ```powershell
   python -m uvicorn app.main:app --reload --port 8000
   ```
   - Base URL: `http://127.0.0.1:8000`
   - Interactive Swagger Docs: `http://127.0.0.1:8000/docs`
   - ReDoc UI: `http://127.0.0.1:8000/redoc`

5. **Run Backend Tests:**
   ```powershell
   python -m pytest tests -v
   ```

---

### 2. Frontend Setup & Run (Port 5173)

1. **Install Dependencies:**
   ```bash
   pnpm install
   # or
   npm install
   ```

2. **Start Vite Dev Server:**
   ```bash
   pnpm run dev
   # or
   npm run dev
   ```
   - Application URL: **`http://localhost:5173`**

3. **Build for Production:**
   ```bash
   npm run build
   ```

---

## 📡 Backend API Reference

All backend endpoints are prefixed with `/api`.

| Method | Endpoint | Description | Role / Channel |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/complaints` | Register a new grievance (Web or Voice Call) | Citizen / IVR |
| `GET` | `/api/complaints` | List & filter grievances by status, dept, priority, source, search | Hospital Staff / Admin |
| `GET` | `/api/complaints/{id}` | Retrieve complete complaint details with audit timeline | All |
| `PATCH`| `/api/complaints/{id}/status` | Update status (`Pending`, `In Progress`, `Resolved`, `Escalated`, `Closed`) | Nodal Officer |
| `PATCH`| `/api/complaints/{id}/assign` | Assign grievance to an officer or sub-department | Superintendent |
| `GET` | `/api/dashboard/stats` | Aggregated dashboard KPIs, channel metrics & dept breakdowns | Management |
| `POST` | `/api/feedback` | Submit citizen satisfaction rating (1–5 stars) & review | Citizen |
| `GET` | `/api/feedback` | List patient feedback entries | Management |

---

## 🖥️ Frontend Implemented Modules

- **Patient Home Page (`/`):** Bilingual landing page (English & Kannada), IVR helpline cards, action buttons.
- **Complaint Registration (`/register`):** Speech-to-text dictation, department auto-assignment, confirmation modal, instant `CV-YYYY-0001` ticket receipt.
- **Complaint Tracking (`/track`):** Live grievance status tracking with audit history, audio readout accessibility, and printable receipts.
- **Hospital Admin Dashboard (`/dashboard`):** Real-time KPI statistics, filters (Category, Status, Source), staff modal for department reassignment and status progression.
- **Role-Based Authentication (`/login`):** Role-based access for Citizens, Hospital Staff, and Administrators.

---

## 🔌 Connecting Supabase Database

1. Open your project on [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **Project Settings** -> **Database** -> **Connection string** (URI).
3. Copy the URI and insert your database password.
4. Set the value in your local `.env` file as `DATABASE_URL`.
5. When the FastAPI server starts, all tables (`complaints`, `complaint_history`, `feedback`) are automatically verified and provisioned.
