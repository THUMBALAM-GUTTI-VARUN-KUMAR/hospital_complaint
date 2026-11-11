"""Sync all local CAREVOICE grievances and audit histories to Supabase."""

import os
import sys
from dotenv import load_dotenv

load_dotenv()

from app.database import SessionLocal
from app.models import Complaint, ComplaintHistory
from app.supabase_client import get_supabase_client, sync_complaint_to_supabase, sync_history_to_supabase


def sync_all():
    client = get_supabase_client()
    if not client:
        print("[ERROR] Supabase client could not be initialized. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.")
        sys.exit(1)

    print("[INFO] Connected to Supabase:", client.supabase_url)
    db = SessionLocal()
    try:
        complaints = db.query(Complaint).all()
        print(f"[INFO] Found {len(complaints)} complaints in local database.")

        synced_complaints = 0
        for c in complaints:
            success = sync_complaint_to_supabase({
                "complaint_id": c.complaint_id,
                "patient_name": c.patient_name,
                "contact_number": c.contact_number,
                "department": c.department,
                "category": c.category,
                "priority": c.priority,
                "status": c.status,
                "source": c.source,
                "description": c.description,
                "assigned_to": c.assigned_to,
                "assigned_department": c.assigned_department,
                "resolution_notes": c.resolution_notes,
                "call_recording_url": c.call_recording_url,
                "transcript": c.transcript,
            })
            if success:
                synced_complaints += 1

        print(f"[SUCCESS] Synced {synced_complaints}/{len(complaints)} complaints to Supabase.")

        # Sync histories
        histories = db.query(ComplaintHistory).all()
        print(f"[INFO] Found {len(histories)} history records.")
        synced_hist = 0
        for h in histories:
            success = sync_history_to_supabase(
                complaint_id=h.complaint_id,
                action=h.action,
                previous_status=h.previous_status,
                new_status=h.new_status,
                assigned_to=h.assigned_to,
                changed_by=h.changed_by,
                notes=h.notes,
            )
            if success:
                synced_hist += 1

        print(f"[SUCCESS] Synced {synced_hist}/{len(histories)} history records to Supabase.")

        # Verify count in Supabase
        res = client.table("complaints").select("id, complaint_id, patient_name, status, department").execute()
        print("\n=== Current Supabase 'complaints' Table ===")
        for r in res.data:
            print(f"- [{r.get('complaint_id')}] {r.get('patient_name')} ({r.get('department')}) -> {r.get('status')}")

    finally:
        db.close()


if __name__ == "__main__":
    sync_all()
