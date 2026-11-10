"""CAREVOICE Business Logic and Helper Services."""

from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import desc
from sqlalchemy.orm import Session
from app.models import Complaint, ComplaintHistory


def generate_complaint_id(db: Session) -> str:
    """Generates a unique complaint ID formatted as CV-YYYY-0001."""
    current_year = datetime.now(timezone.utc).year
    prefix = f"CV-{current_year}-"

    # Query latest complaint matching the current year's prefix
    latest_record = (
        db.query(Complaint)
        .filter(Complaint.complaint_id.like(f"{prefix}%"))
        .order_by(desc(Complaint.complaint_id))
        .first()
    )

    if latest_record and latest_record.complaint_id:
        try:
            parts = latest_record.complaint_id.split("-")
            last_seq = int(parts[-1])
            next_seq = last_seq + 1
        except (ValueError, IndexError):
            next_seq = 1
    else:
        next_seq = 1

    return f"{prefix}{next_seq:04d}"


def record_complaint_history(
    db: Session,
    complaint_id: str,
    action: str,
    previous_status: Optional[str] = None,
    new_status: Optional[str] = None,
    assigned_to: Optional[str] = None,
    changed_by: str = "System",
    notes: Optional[str] = None,
) -> ComplaintHistory:
    """Creates an audit trail entry for a grievance lifecycle event."""
    history_entry = ComplaintHistory(
        complaint_id=complaint_id,
        action=action,
        previous_status=previous_status,
        new_status=new_status,
        assigned_to=assigned_to,
        changed_by=changed_by,
        notes=notes,
    )
    db.add(history_entry)
    db.flush()
    return history_entry
