"""CAREVOICE Complaints Router.

Implements:
- POST  /api/complaints
- GET   /api/complaints
- GET   /api/complaints/{complaint_id}
- PATCH /api/complaints/{complaint_id}/status
- PATCH /api/complaints/{complaint_id}/assign
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Complaint
from app.schemas import (
    ComplaintAssignUpdate,
    ComplaintCreate,
    ComplaintResponse,
    ComplaintStatusUpdate,
)
from app.services import generate_complaint_id, record_complaint_history

router = APIRouter(prefix="/api/complaints", tags=["Complaints"])


@router.post(
    "",
    response_model=ComplaintResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new grievance (Web or Voice Call)",
)
def create_complaint(
    payload: ComplaintCreate,
    db: Session = Depends(get_db),
):
    """Submits a new grievance from web form or voice call intake,

    assigns a unique CV-YYYY-0001 identifier, and logs creation in history.
    """
    new_id = generate_complaint_id(db)

    desc = (payload.description or payload.complaint_text or "No description provided").strip()
    p_name = (payload.patient_name or "Citizen").strip()
    dept = (payload.department or "Hospital Administration").strip()
    cat = (payload.category or "Other").strip()

    complaint = Complaint(
        complaint_id=new_id,
        patient_name=p_name,
        contact_number=payload.contact_number.strip() if payload.contact_number else None,
        department=dept,
        category=cat,
        priority=payload.priority.value,
        status="Pending",
        source=payload.source.value,
        description=desc,
        assigned_to=payload.assigned_to.strip() if payload.assigned_to else None,
        assigned_department=payload.assigned_department.strip() if payload.assigned_department else None,
        call_recording_url=payload.call_recording_url,
        transcript=payload.transcript,
    )

    db.add(complaint)
    db.flush()

    # Log initial creation history
    record_complaint_history(
        db=db,
        complaint_id=new_id,
        action="COMPLAINT_CREATED",
        previous_status=None,
        new_status="Pending",
        assigned_to=complaint.assigned_to,
        changed_by="Intake Service" if complaint.source == "voice_call" else "Citizen Portal",
        notes=f"Complaint lodged via {complaint.source}.",
    )

    db.commit()
    db.refresh(complaint)
    return complaint


@router.get(
    "",
    response_model=List[ComplaintResponse],
    summary="List and filter grievances",
)
def list_complaints(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status (Pending, In Progress, etc.)"),
    department: Optional[str] = Query(None, description="Filter by department"),
    priority: Optional[str] = Query(None, description="Filter by priority level"),
    source: Optional[str] = Query(None, description="Filter by intake source (web or voice_call)"),
    search: Optional[str] = Query(None, description="Search term for complaint ID, patient name, or description"),
    skip: int = Query(0, ge=0, description="Pagination skip offset"),
    limit: int = Query(100, ge=1, le=500, description="Pagination page limit"),
    db: Session = Depends(get_db),
):
    """Retrieves grievances matching the specified query filters."""
    query = db.query(Complaint)

    if status_filter:
        query = query.filter(Complaint.status.ilike(f"%{status_filter.strip()}%"))

    if department:
        query = query.filter(Complaint.department.ilike(f"%{department.strip()}%"))

    if priority:
        query = query.filter(Complaint.priority.ilike(f"%{priority.strip()}%"))

    if source:
        query = query.filter(Complaint.source.ilike(f"%{source.strip()}%"))

    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Complaint.complaint_id.ilike(search_pattern),
                Complaint.patient_name.ilike(search_pattern),
                Complaint.description.ilike(search_pattern),
                Complaint.category.ilike(search_pattern),
            )
        )

    complaints = query.order_by(Complaint.created_at.desc()).offset(skip).limit(limit).all()
    return complaints


def find_complaint_by_any_id(db: Session, identifier: str) -> Optional[Complaint]:
    """Finds a complaint by complaint_id (e.g. CV-2026-0006), integer id (e.g. 6),
    or trailing digits (e.g. 0006).
    """
    clean = str(identifier).strip()
    if not clean:
        return None

    # 1. Exact case-insensitive match on complaint_id
    c = db.query(Complaint).filter(Complaint.complaint_id.ilike(clean)).first()
    if c:
        return c

    # 2. If clean is an integer, check integer id or padded suffix
    if clean.isdigit():
        int_id = int(clean)
        c = db.query(Complaint).filter(Complaint.id == int_id).first()
        if c:
            return c
        c = db.query(Complaint).filter(Complaint.complaint_id.ilike(f"%-{clean.zfill(4)}")).first()
        if c:
            return c

    # 3. If identifier is like CV-6 or CV-2026-6 without 4-digit padding
    if clean.upper().startswith("CV-"):
        parts = clean.split("-")
        last_part = parts[-1]
        if last_part.isdigit():
            c = db.query(Complaint).filter(Complaint.complaint_id.ilike(f"%-{last_part.zfill(4)}")).first()
            if c:
                return c

    return None


@router.get(
    "/{complaint_id}",
    response_model=ComplaintResponse,
    summary="Get grievance details by complaint ID",
)
def get_complaint(
    complaint_id: str,
    db: Session = Depends(get_db),
):
    """Retrieves full details and timeline history for a specific grievance."""
    complaint = find_complaint_by_any_id(db, complaint_id)
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Complaint with ID '{complaint_id}' was not found.",
        )
    return complaint


@router.patch(
    "/{complaint_id}/status",
    response_model=ComplaintResponse,
    summary="Update grievance status and record audit log",
)
def update_complaint_status(
    complaint_id: str,
    payload: ComplaintStatusUpdate,
    db: Session = Depends(get_db),
):
    """Updates complaint status, writes resolution notes if provided,

    and appends a transition record to complaint_history.
    """
    complaint = find_complaint_by_any_id(db, complaint_id)
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Complaint with ID '{complaint_id}' was not found.",
        )

    previous_status = complaint.status
    new_status = payload.status.value

    complaint.status = new_status
    if payload.resolution_notes:
        complaint.resolution_notes = payload.resolution_notes.strip()

    record_complaint_history(
        db=db,
        complaint_id=complaint.complaint_id,
        action="STATUS_CHANGED",
        previous_status=previous_status,
        new_status=new_status,
        assigned_to=complaint.assigned_to,
        changed_by=payload.changed_by or "Admin",
        notes=payload.notes or f"Status transitioned from {previous_status} to {new_status}.",
    )

    db.commit()
    db.refresh(complaint)
    return complaint


@router.patch(
    "/{complaint_id}/assign",
    response_model=ComplaintResponse,
    summary="Assign grievance to an officer or department",
)
def assign_complaint(
    complaint_id: str,
    payload: ComplaintAssignUpdate,
    db: Session = Depends(get_db),
):
    """Assigns complaint to a staff member or department and logs the assignment event."""
    complaint = find_complaint_by_any_id(db, complaint_id)
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Complaint with ID '{complaint_id}' was not found.",
        )

    previous_assignee = complaint.assigned_to
    complaint.assigned_to = payload.assigned_to.strip()
    if payload.assigned_department:
        complaint.assigned_department = payload.assigned_department.strip()

    # Auto transition from Pending to In Progress if currently Pending
    prev_status = complaint.status
    if complaint.status == "Pending":
        complaint.status = "In Progress"

    record_complaint_history(
        db=db,
        complaint_id=complaint_id,
        action="ASSIGNED",
        previous_status=prev_status,
        new_status=complaint.status,
        assigned_to=complaint.assigned_to,
        changed_by=payload.changed_by or "Admin",
        notes=payload.notes or f"Assigned to {complaint.assigned_to} (Previous: {previous_assignee or 'Unassigned'}).",
    )

    db.commit()
    db.refresh(complaint)
    return complaint
