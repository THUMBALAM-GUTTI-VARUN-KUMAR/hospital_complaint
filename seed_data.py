"""Seed sample data for CAREVOICE database if empty."""
from app.database import SessionLocal, init_db
from app.models import Complaint, ComplaintHistory

def seed():
    init_db()
    db = SessionLocal()
    try:
        count = db.query(Complaint).count()
        if count > 0:
            print(f"Database already contains {count} complaints. Skipping seed.")
            return

        sample_complaints = [
            Complaint(
                complaint_id="CV-2026-0001",
                patient_name="Rajesh Kumar",
                contact_number="+91 98765 43210",
                department="Pharmacy & Medical Supplies",
                category="Medicine unavailable",
                priority="High",
                status="In Progress",
                source="web",
                description="The pharmacy counter in Block B has run out of pediatric Paracetamol and ORS packets.",
                assigned_to="Dr. Sunita Rao",
                assigned_department="Pharmacy & Medical Supplies",
            ),
            Complaint(
                complaint_id="CV-2026-0002",
                patient_name="ಮಂಜುನಾಥ್ (Manjunath)",
                contact_number="+91 94481 23456",
                department="Sanitation & Housekeeping Wing",
                category="Cleanliness problem",
                priority="Medium",
                status="Pending",
                source="voice_call",
                description="ವಾರ್ಡ್ 4 ರ ಶೌಚಾಲಯದಲ್ಲಿ ನೀರಿನ ಸೌಲಭ್ಯವಿಲ್ಲ ಮತ್ತು ಸ್ವಚ್ಛತೆ ಇಲ್ಲ.",
                transcript="ವಾರ್ಡ್ 4 ರ ಶೌಚಾಲಯದಲ್ಲಿ ನೀರಿನ ಸೌಲಭ್ಯವಿಲ್ಲ ಮತ್ತು ಸ್ವಚ್ಛತೆ ಇಲ್ಲ.",
            ),
            Complaint(
                complaint_id="CV-2026-0003",
                patient_name="Anita Deshmukh",
                contact_number="+91 98220 99887",
                department="Hospital Administration / Medical Superintendent",
                category="Doctor or staff unavailable",
                priority="Critical",
                status="Resolved",
                source="web",
                description="Duty medical officer was unavailable in the casualty wing between 2 PM and 4 PM.",
                assigned_to="Dr. A. K. Sharma",
                assigned_department="Hospital Administration / Medical Superintendent",
                resolution_notes="Relieving medical officer was immediately posted on emergency duty.",
            ),
            Complaint(
                complaint_id="CV-2026-0004",
                patient_name="ರಮೇಶ್ ಗೌಡ (Ramesh Gowda)",
                contact_number="+91 99001 54321",
                department="Hospital Infrastructure & Maintenance",
                category="Drinking water problem",
                priority="Medium",
                status="Pending",
                source="voice_call",
                description="ಕುಡಿಯುವ ನೀರಿನ ಫಿಲ್ಟರ್ ಕೆಟ್ಟುಹೋಗಿದೆ, ಬಿಸಿನೀರು ಲಭ್ಯವಿಲ್ಲ.",
                transcript="ಕುಡಿಯುವ ನೀರಿನ ಫಿಲ್ಟರ್ ಕೆಟ್ಟುಹೋಗಿದೆ, ಬಿಸಿನೀರು ಲಭ್ಯವಿಲ್ಲ.",
            ),
        ]

        for c in sample_complaints:
            db.add(c)
            db.flush()
            history = ComplaintHistory(
                complaint_id=c.complaint_id,
                action="COMPLAINT_CREATED",
                new_status=c.status,
                assigned_to=c.assigned_to,
                changed_by="CareVoice Initial Seed",
                notes=f"Initial record created via {c.source}."
            )
            db.add(history)

        db.commit()
        print("Successfully seeded 4 sample complaints with audit history.")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
