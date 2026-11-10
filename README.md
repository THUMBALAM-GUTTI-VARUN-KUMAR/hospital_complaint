# CAREVOICE - Backend API

> **Public Hospital Grievance Registration and Monitoring System**
> High-performance, omni-channel backend built with **FastAPI**, **SQLAlchemy**, and **Supabase (PostgreSQL)**.

---

## 🏥 Overview

CAREVOICE is an automated grievance redressal system designed for public and government hospitals. It accepts citizen and patient complaints through multiple channels:
- **Web Portal**: Online citizen intake form.
- **Voice Call**: Automated telephony / IVR / speech intake with call recordings and audio transcripts.

The backend provides complete complaint lifecycle management: unique complaint ID generation (`CV-YYYY-0001`), department routing, officer assignment, status workflow progression, audit trail logging, citizen feedback collection, and real-time dashboard analytics.

---

## 🛠️ Tech Stack

- **Framework:** FastAPI (Python 3.11)
- **ASGI Server:** Uvicorn
- **ORM:** SQLAlchemy 2.0
- **Database:** Supabase PostgreSQL (with automatic SQLite fallback for offline local development)
- **Validation & Serialization:** Pydantic v2
- **Testing:** Pytest & HTTPX
- **Environment Management:** Python-dotenv

---

## 📁 Project Structure

```text
hospital_complaint/
├── .env.example              # Environment variables template
├── .env                      # Local environment configuration (never commit)
├── .gitignore                # Git ignore configuration
├── requirements.txt          # Python dependencies
├── README.md                 # Setup and run documentation
├── app/
│   ├── __init__.py
│   ├── main.py               # FastAPI entrypoint, CORS & middleware
│   ├── database.py           # SQLAlchemy engine & session management
│   ├── models.py             # ORM models: Complaints, History, Feedback
│   ├── schemas.py            # Pydantic validation schemas
│   ├── services.py           # ID generation (CV-YYYY-0001) & audit trails
│   └── routers/
│       ├── __init__.py
│       ├── complaints.py     # Complaint registration, search & workflow APIs
│       ├── dashboard.py      # Analytics and KPI stats API
│       └── feedback.py       # Patient review & feedback APIs
└── tests/
    ├── __init__.py
    ├── conftest.py           # Test fixtures & isolated in-memory DB
    ├── test_complaints.py    # Test cases for complaint lifecycle
    ├── test_dashboard.py     # Test cases for analytics metrics
    └── test_feedback.py      # Test cases for patient ratings
```

---

## 🚀 Setup & Installation

### 1. Prerequisites
- **Python 3.11.x**
- Git

### 2. Activate Virtual Environment
Use the existing virtual environment:

**Windows (PowerShell):**
```powershell
.\.venv\Scripts\Activate.ps1
```

**Windows (Command Prompt):**
```cmd
.venv\Scripts\activate.bat
```

**Linux / macOS:**
```bash
source .venv/bin/activate
```

### 3. Install Dependencies
```powershell
pip install -r requirements.txt
```

---

## ⚙️ Environment Configuration

Copy `.env.example` to `.env`:
```powershell
Copy-Item .env.example .env
```

Edit `.env` to configure your Supabase connection and frontend origins:
```env
# Supabase PostgreSQL Connection String
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# Application Environment
ENVIRONMENT=development

# CORS Allowed Origins (Comma-separated for React frontends)
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173
```

> **Database Configuration:**
> The backend connects directly to your Supabase PostgreSQL database using the `DATABASE_URL` configured in `.env`.

---

## 🏃 Running the Backend

Start the development server with live reload:
```powershell
python -m uvicorn app.main:app --reload --port 8000
```

Once running:
- **API Base URL:** `http://127.0.0.1:8000`
- **Interactive Swagger Docs:** `http://127.0.0.1:8000/docs`
- **Alternative ReDoc UI:** `http://127.0.0.1:8000/redoc`
- **Health Check:** `http://127.0.0.1:8000/health`

---

## 🧪 Running Automated Tests

Run the complete test suite with verbose output:
```powershell
python -m pytest tests -v
```

---

## 📡 API Reference

All endpoints are prefixed with `/api`.

| Method | Endpoint | Description | Channel / Role |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/complaints` | Register a new grievance (Web or Voice Call) | Citizen / IVR |
| `GET` | `/api/complaints` | Filter and list grievances by status, dept, priority, source, search | Hospital Admin |
| `GET` | `/api/complaints/{id}` | Retrieve complete complaint details with audit timeline | All |
| `PATCH`| `/api/complaints/{id}/status` | Update grievance status (`Pending`, `In Progress`, `Resolved`, `Escalated`, `Closed`) | Nodal Officer |
| `PATCH`| `/api/complaints/{id}/assign` | Assign grievance to a staff member or department | Superintendent |
| `GET` | `/api/dashboard/stats` | Aggregate dashboard KPIs and departmental breakdowns | Management |
| `POST` | `/api/feedback` | Submit citizen satisfaction rating (1-5 stars) and review | Citizen |

---

## 🔌 Connecting Supabase

To connect the live Supabase PostgreSQL database:

1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open your CAREVOICE project.
3. Navigate to **Project Settings** (gear icon in sidebar) -> **Database**.
4. Scroll down to **Connection parameters** / **Connection string**.
5. Select **URI** mode:
   - For direct connection: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
   - For pooled connection (recommended for serverless/high concurrency): `postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`
6. Replace `[YOUR-PASSWORD]` with your actual database password.
7. Paste this string into your `.env` file as `DATABASE_URL`.
8. Start the FastAPI server (`python -m uvicorn app.main:app --reload`). All tables (`complaints`, `complaint_history`, `feedback`) will be automatically created in your Supabase database on initial startup!
