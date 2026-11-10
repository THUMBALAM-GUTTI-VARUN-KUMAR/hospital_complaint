"""
CareVoice Reference & Mock FastAPI Backend
Matches the exact API Contract specified for CareVoice frontend development.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uuid
import datetime

app = FastAPI(title="CareVoice Hospital Grievance Backend")

# Enable CORS for frontend at port 5173
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

complaints_db = [
    {
        "id": "CV-2026-0101",
        "complaint_id": "CV-2026-0101",
        "complaint_text": "Pharmacy in Ward 2 has no Paracetamol and pediatric oral rehydration salts for 2 days.",
        "category": "Medicine unavailable",
        "department": "Pharmacy & Medical Supplies",
        "language": "en",
        "source": "web",
        "status": "In Progress",
        "created_at": "2026-11-09T10:15:00Z",
        "history": [
            {"status": "Submitted", "timestamp": "2026-11-09 10:15", "remarks": "Logged via Web Portal"},
            {"status": "In Progress", "timestamp": "2026-11-09 11:30", "remarks": "Stock indent placed with district warehouse"}
        ]
    },
    {
        "id": "CV-2026-0102",
        "complaint_id": "CV-2026-0102",
        "complaint_text": "ವಾರ್ಡ್ 4 ರ ಶೌಚಾಲಯದಲ್ಲಿ ನೀರಿನ ಸೌಲಭ್ಯವಿಲ್ಲ ಮತ್ತು ಸ್ವಚ್ಛತೆ ಇಲ್ಲ.",
        "category": "Cleanliness problem",
        "department": "Sanitation & Housekeeping Wing",
        "language": "kn",
        "source": "voice",
        "status": "Pending",
        "created_at": "2026-11-09T14:40:00Z",
        "history": [
            {"status": "Submitted", "timestamp": "2026-11-09 14:40", "remarks": "Logged via 24/7 AI Voice Phone Helpline"}
        ]
    },
    {
        "id": "CV-2026-0103",
        "complaint_id": "CV-2026-0103",
        "complaint_text": "Duty doctor not present in orthopedic OPD during scheduled visiting hours.",
        "category": "Doctor or staff unavailable",
        "department": "Hospital Administration / Medical Superintendent",
        "language": "en",
        "source": "web",
        "status": "Resolved",
        "created_at": "2026-11-08T09:20:00Z",
        "history": [
            {"status": "Submitted", "timestamp": "2026-11-08 09:20", "remarks": "Web submission"},
            {"status": "Resolved", "timestamp": "2026-11-08 12:00", "remarks": "Deputed relieving medical officer on duty"}
        ]
    },
    {
        "id": "CV-2026-0104",
        "complaint_id": "CV-2026-0104",
        "complaint_text": "ಕುಡಿಯುವ ನೀರಿನ ಫಿಲ್ಟರ್ ಕೆಟ್ಟುಹೋಗಿದೆ, ಬಿಸಿನೀರು ಲಭ್ಯವಿಲ್ಲ.",
        "category": "Drinking water problem",
        "department": "Hospital Infrastructure & Maintenance",
        "language": "kn",
        "source": "voice",
        "status": "Submitted",
        "created_at": "2026-11-10T08:05:00Z",
        "history": [
            {"status": "Submitted", "timestamp": "2026-11-10 08:05", "remarks": "Voice telephone IVR call"}
        ]
    }
]

class ComplaintCreate(BaseModel):
    complaint_text: str
    language: Optional[str] = "en"
    source: Optional[str] = "web"
    category: Optional[str] = None
    department: Optional[str] = None

class StatusUpdate(BaseModel):
    status: str
    department: Optional[str] = None
    remarks: Optional[str] = None

@app.get("/")
def root():
    return {"message": "CareVoice Hospital Grievance Redressal API is online", "status": "ok"}

@app.get("/api/dashboard/stats")
def get_dashboard_stats():
    total = len(complaints_db)
    submitted = sum(1 for c in complaints_db if "submit" in c["status"].lower())
    pending = sum(1 for c in complaints_db if "pend" in c["status"].lower())
    in_progress = sum(1 for c in complaints_db if "progress" in c["status"].lower())
    resolved = sum(1 for c in complaints_db if "resolve" in c["status"].lower())
    return {
        "total": total,
        "submitted": submitted,
        "pending": pending,
        "in_progress": in_progress,
        "resolved": resolved
    }

@app.get("/api/complaints")
def get_all_complaints():
    return complaints_db

@app.get("/api/complaints/{complaint_id}")
def get_complaint(complaint_id: str):
    clean = complaint_id.strip()
    for c in complaints_db:
        if c["id"].lower() == clean.lower() or c["complaint_id"].lower() == clean.lower():
            return c
    raise HTTPException(status_code=404, detail="Complaint not found")

@app.post("/api/complaints", status_code=201)
def create_complaint(body: ComplaintCreate):
    new_id = f"CV-{datetime.datetime.now().year}-{len(complaints_db) + 101:04d}"
    
    # Auto-assign department if not supplied
    dept = body.department or "Hospital Administration / Medical Superintendent"
    cat = body.category or "Other"

    record = {
        "id": new_id,
        "complaint_id": new_id,
        "complaint_text": body.complaint_text,
        "category": cat,
        "department": dept,
        "language": body.language or "en",
        "source": body.source or "web",
        "status": "Submitted",
        "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "history": [
            {
                "status": "Submitted",
                "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
                "remarks": f"Registered via {body.source or 'web'}"
            }
        ]
    }
    complaints_db.insert(0, record)
    return record

@app.patch("/api/complaints/{complaint_id}/status")
def update_status(complaint_id: str, body: StatusUpdate):
    clean = complaint_id.strip()
    for c in complaints_db:
        if c["id"].lower() == clean.lower() or c["complaint_id"].lower() == clean.lower():
            c["status"] = body.status
            if body.department:
                c["department"] = body.department
            if "history" not in c:
                c["history"] = []
            c["history"].append({
                "status": body.status,
                "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
                "remarks": body.remarks or f"Status changed to {body.status}"
            })
            return c
    raise HTTPException(status_code=404, detail="Complaint not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
