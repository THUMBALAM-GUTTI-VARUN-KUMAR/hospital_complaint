"""CAREVOICE Dashboard Analytics Router.

Implements:
- GET /api/dashboard/stats
"""

from collections import Counter
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Complaint, Feedback
from app.schemas import DashboardStatsResponse

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get(
    "/stats",
    response_model=DashboardStatsResponse,
    summary="Get aggregated grievance and feedback statistics",
)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Computes real-time analytical metrics for the CAREVOICE operational dashboard."""
    all_complaints = db.query(Complaint).all()

    total_complaints = len(all_complaints)
    pending_count = sum(1 for c in all_complaints if c.status == "Pending")
    in_progress_count = sum(1 for c in all_complaints if c.status == "In Progress")
    resolved_count = sum(1 for c in all_complaints if c.status == "Resolved")
    escalated_count = sum(1 for c in all_complaints if c.status == "Escalated")
    closed_count = sum(1 for c in all_complaints if c.status == "Closed")

    web_count = sum(1 for c in all_complaints if c.source == "web")
    voice_count = sum(1 for c in all_complaints if c.source == "voice_call")

    dept_counts = Counter(c.department for c in all_complaints if c.department)
    priority_counts = Counter(c.priority for c in all_complaints if c.priority)
    category_counts = Counter(c.category for c in all_complaints if c.category)

    # Feedback aggregation
    feedback_stats = db.query(
        func.count(Feedback.id).label("total_feedback"),
        func.avg(Feedback.rating).label("avg_rating"),
    ).first()

    total_feedbacks = feedback_stats.total_feedback if feedback_stats and feedback_stats.total_feedback else 0
    avg_rating = round(float(feedback_stats.avg_rating), 2) if feedback_stats and feedback_stats.avg_rating else 0.0

    recent_complaints = (
        db.query(Complaint)
        .order_by(Complaint.created_at.desc())
        .limit(5)
        .all()
    )

    return DashboardStatsResponse(
        total_complaints=total_complaints,
        pending_complaints=pending_count,
        in_progress_complaints=in_progress_count,
        resolved_complaints=resolved_count,
        escalated_complaints=escalated_count,
        closed_complaints=closed_count,
        web_complaints=web_count,
        voice_call_complaints=voice_count,
        average_feedback_rating=avg_rating,
        total_feedback_count=total_feedbacks,
        department_breakdown=dict(dept_counts),
        priority_breakdown=dict(priority_counts),
        category_breakdown=dict(category_counts),
        recent_complaints=recent_complaints,
    )
