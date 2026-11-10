"""CAREVOICE SQLAlchemy Database Models."""

from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class Complaint(Base):
    """Complaints model storing grievance tickets from Web and Voice Call channels."""

    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    complaint_id = Column(String(32), unique=True, index=True, nullable=False)
    patient_name = Column(String(255), nullable=False)
    contact_number = Column(String(50), nullable=True)
    department = Column(String(100), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    priority = Column(String(50), nullable=False, default="Medium")
    status = Column(String(50), nullable=False, default="Pending", index=True)
    source = Column(String(50), nullable=False, default="web", index=True)  # "web" or "voice_call"
    description = Column(Text, nullable=False)
    assigned_to = Column(String(255), nullable=True)
    assigned_department = Column(String(100), nullable=True)
    resolution_notes = Column(Text, nullable=True)

    # Metadata for voice calls or omni-channel intake
    call_recording_url = Column(String(500), nullable=True)
    transcript = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), default=utc_now, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, server_default=func.now(), onupdate=utc_now, nullable=False)

    # Relationships
    history = relationship(
        "ComplaintHistory",
        back_populates="complaint",
        cascade="all, delete-orphan",
        order_by="ComplaintHistory.created_at.desc()",
    )
    feedbacks = relationship(
        "Feedback",
        back_populates="complaint",
        cascade="all, delete-orphan",
    )


class ComplaintHistory(Base):
    """Audit trail and timeline tracking for every status transition or assignment."""

    __tablename__ = "complaint_history"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    complaint_id = Column(String(32), ForeignKey("complaints.complaint_id", ondelete="CASCADE"), nullable=False, index=True)
    action = Column(String(100), nullable=False)  # CREATED, STATUS_CHANGED, ASSIGNED, RESOLVED, etc.
    previous_status = Column(String(50), nullable=True)
    new_status = Column(String(50), nullable=True)
    assigned_to = Column(String(255), nullable=True)
    changed_by = Column(String(255), nullable=False, default="System")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, server_default=func.now(), nullable=False)

    complaint = relationship("Complaint", back_populates="history")


class Feedback(Base):
    """Feedback model capturing citizen/patient ratings and resolution reviews."""

    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    complaint_id = Column(String(32), ForeignKey("complaints.complaint_id", ondelete="SET NULL"), nullable=True, index=True)
    patient_name = Column(String(255), nullable=True)
    rating = Column(Integer, nullable=False)  # 1 to 5 stars
    comments = Column(Text, nullable=True)
    service_aspect = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, server_default=func.now(), nullable=False)

    complaint = relationship("Complaint", back_populates="feedbacks")
