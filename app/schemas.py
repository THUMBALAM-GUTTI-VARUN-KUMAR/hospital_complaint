"""CAREVOICE Pydantic Request & Response Schemas."""

from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class SourceType(str, Enum):
    WEB = "web"
    VOICE_CALL = "voice_call"


class PriorityLevel(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


class ComplaintStatus(str, Enum):
    PENDING = "Pending"
    IN_PROGRESS = "In Progress"
    RESOLVED = "Resolved"
    ESCALATED = "Escalated"
    CLOSED = "Closed"


# --- Complaint Schemas ---


class ComplaintCreate(BaseModel):
    """Schema for submitting a new grievance via Web portal or Voice Call integration."""

    patient_name: Optional[str] = Field("Citizen", max_length=255, description="Full name of the patient or complainant")
    contact_number: Optional[str] = Field(None, max_length=50, description="Phone number or mobile contact")
    department: Optional[str] = Field("Hospital Administration", max_length=100, description="Concerned hospital department")
    category: Optional[str] = Field("Other", max_length=100, description="Complaint category")
    priority: PriorityLevel = Field(default=PriorityLevel.MEDIUM, description="Initial priority level")
    source: SourceType = Field(default=SourceType.WEB, description="Channel of intake: web or voice_call")
    description: Optional[str] = Field(None, description="Detailed description of the grievance")
    complaint_text: Optional[str] = Field(None, description="Alternative field for complaint text")
    language: Optional[str] = Field("en", description="Language code")
    assigned_to: Optional[str] = Field(None, description="Optional pre-assigned staff member or nodal officer")
    assigned_department: Optional[str] = Field(None, description="Optional target department for assignment")
    call_recording_url: Optional[str] = Field(None, description="Audio recording URL if received through voice call")
    transcript: Optional[str] = Field(None, description="Speech-to-text transcript if received through voice call")


class ComplaintStatusUpdate(BaseModel):
    """Schema for updating grievance workflow status."""

    status: ComplaintStatus = Field(..., description="Target status")
    changed_by: Optional[str] = Field("Admin", description="User or system entity making the change")
    notes: Optional[str] = Field(None, description="Reason or context for the status update")
    resolution_notes: Optional[str] = Field(None, description="Resolution details when resolving or closing")


class ComplaintAssignUpdate(BaseModel):
    """Schema for assigning grievance to a staff member or department."""

    assigned_to: str = Field(..., min_length=2, description="Staff member, doctor, or nodal officer name")
    assigned_department: Optional[str] = Field(None, description="Specific sub-department or wing")
    changed_by: Optional[str] = Field("Admin", description="User or supervisor executing the assignment")
    notes: Optional[str] = Field(None, description="Internal assignment notes or instructions")


class ComplaintHistoryResponse(BaseModel):
    """Schema for tracking grievance history events."""

    id: int
    complaint_id: str
    action: str
    previous_status: Optional[str] = None
    new_status: Optional[str] = None
    assigned_to: Optional[str] = None
    changed_by: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ComplaintResponse(BaseModel):
    """Comprehensive grievance response schema."""

    id: int
    complaint_id: str
    patient_name: str
    contact_number: Optional[str] = None
    department: str
    category: str
    priority: str
    status: str
    source: str
    description: str
    complaint_text: Optional[str] = None
    assigned_to: Optional[str] = None
    assigned_department: Optional[str] = None
    resolution_notes: Optional[str] = None
    call_recording_url: Optional[str] = None
    transcript: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    history: List[ComplaintHistoryResponse] = []

    model_config = ConfigDict(from_attributes=True)


# --- Feedback Schemas ---


class FeedbackCreate(BaseModel):
    """Schema for submitting citizen satisfaction feedback."""

    complaint_id: Optional[str] = Field(None, description="Associated CAREVOICE Complaint ID (e.g., CV-2026-0001)")
    patient_name: Optional[str] = Field(None, description="Citizen or patient name")
    rating: int = Field(..., ge=1, le=5, description="Star rating from 1 to 5")
    comments: Optional[str] = Field(None, description="Feedback text or review remarks")
    service_aspect: Optional[str] = Field(None, description="Specific aspect, e.g., 'Resolution Speed', 'Staff Courtesy'")


class FeedbackResponse(BaseModel):
    """Schema for feedback responses."""

    id: int
    complaint_id: Optional[str] = None
    patient_name: Optional[str] = None
    rating: int
    comments: Optional[str] = None
    service_aspect: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Dashboard Stats Schemas ---


class DashboardStatsResponse(BaseModel):
    """Aggregated analytical statistics for the hospital grievance dashboard."""

    total_complaints: int
    pending_complaints: int
    in_progress_complaints: int
    resolved_complaints: int
    escalated_complaints: int
    closed_complaints: int
    web_complaints: int
    voice_call_complaints: int
    average_feedback_rating: float
    total_feedback_count: int
    department_breakdown: Dict[str, int]
    priority_breakdown: Dict[str, int]
    category_breakdown: Dict[str, int]
    recent_complaints: List[ComplaintResponse]
