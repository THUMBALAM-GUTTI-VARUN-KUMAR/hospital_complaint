"""CAREVOICE Feedback Router.

Implements:
- POST /api/feedback
- GET  /api/feedback
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Complaint, Feedback
from app.schemas import FeedbackCreate, FeedbackResponse
from app.services import record_complaint_history

router = APIRouter(prefix="/api/feedback", tags=["Feedback"])


@router.post(
    "",
    response_model=FeedbackResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit patient satisfaction feedback",
)
def create_feedback(
    payload: FeedbackCreate,
    db: Session = Depends(get_db),
):
    """Submits citizen or patient feedback with rating (1-5), comments, and optional complaint linking."""
    complaint_obj = None
    if payload.complaint_id:
        complaint_obj = db.query(Complaint).filter(Complaint.complaint_id == payload.complaint_id.strip()).first()
        if not complaint_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Associated complaint with ID '{payload.complaint_id}' was not found.",
            )

    feedback = Feedback(
        complaint_id=payload.complaint_id.strip() if payload.complaint_id else None,
        patient_name=payload.patient_name.strip() if payload.patient_name else (complaint_obj.patient_name if complaint_obj else None),
        rating=payload.rating,
        comments=payload.comments.strip() if payload.comments else None,
        service_aspect=payload.service_aspect.strip() if payload.service_aspect else None,
    )

    db.add(feedback)
    db.flush()

    if complaint_obj:
        record_complaint_history(
            db=db,
            complaint_id=complaint_obj.complaint_id,
            action="FEEDBACK_RECEIVED",
            previous_status=complaint_obj.status,
            new_status=complaint_obj.status,
            assigned_to=complaint_obj.assigned_to,
            changed_by="Citizen",
            notes=f"Citizen submitted feedback with rating {feedback.rating}/5.",
        )

    db.commit()
    db.refresh(feedback)
    return feedback


@router.get(
    "",
    response_model=List[FeedbackResponse],
    summary="List patient feedback",
)
def list_feedback(
    complaint_id: Optional[str] = Query(None, description="Filter by complaint ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """Lists feedback entries with optional filtering by complaint ID."""
    query = db.query(Feedback)
    if complaint_id:
        query = query.filter(Feedback.complaint_id == complaint_id.strip())
    return query.order_by(Feedback.created_at.desc()).offset(skip).limit(limit).all()
