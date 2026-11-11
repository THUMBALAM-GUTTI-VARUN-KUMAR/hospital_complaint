"""CAREVOICE Supabase Integration Client.

Provides direct access to Supabase database using SUPABASE_SERVICE_ROLE_KEY
and real-time synchronization helpers.
"""

import logging
import os
import re
from datetime import datetime, timezone
from typing import Any, Dict, Optional
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("carevoice.supabase")

RAW_URL = os.getenv("SUPABASE_URL", "https://wjppxtgunxqinuxpjeau.supabase.co")
SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()

# Normalize REST API endpoint if user provided postgresql:// format
if RAW_URL.startswith("postgresql://") or RAW_URL.startswith("postgres://"):
    match = re.search(r"postgres\.([a-z0-9]+)", RAW_URL)
    if match:
        REST_URL = f"https://{match.group(1)}.supabase.co"
    else:
        REST_URL = "https://wjppxtgunxqinuxpjeau.supabase.co"
else:
    REST_URL = RAW_URL.strip()

_supabase_client = None


def get_supabase_client():
    """Returns singleton Supabase client or None if credentials are missing."""
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    if not REST_URL or not SERVICE_KEY:
        logger.warning("Supabase URL or SERVICE_ROLE_KEY not configured.")
        return None

    try:
        from supabase import Client, create_client
        _supabase_client = create_client(REST_URL, SERVICE_KEY)
        logger.info("Supabase client initialized successfully (%s)", REST_URL)
        return _supabase_client
    except Exception as exc:
        logger.error("Failed to initialize Supabase client: %s", exc)
        return None


def sync_complaint_to_supabase(complaint_data: Dict[str, Any]) -> bool:
    """Inserts or updates a complaint row in Supabase."""
    client = get_supabase_client()
    if not client:
        return False

    try:
        # Build payload matching Supabase schema
        payload = {
            "complaint_id": complaint_data.get("complaint_id"),
            "patient_name": complaint_data.get("patient_name") or "Citizen",
            "contact_number": complaint_data.get("contact_number"),
            "department": complaint_data.get("department") or "Hospital Administration",
            "category": complaint_data.get("category") or "Other",
            "priority": str(complaint_data.get("priority", "Medium")),
            "status": str(complaint_data.get("status", "Pending")),
            "source": str(complaint_data.get("source", "web")),
            "description": complaint_data.get("description") or "",
            "assigned_to": complaint_data.get("assigned_to"),
            "assigned_department": complaint_data.get("assigned_department"),
            "resolution_notes": complaint_data.get("resolution_notes"),
            "call_recording_url": complaint_data.get("call_recording_url"),
            "transcript": complaint_data.get("transcript"),
        }

        # Use upsert based on unique complaint_id
        client.table("complaints").upsert(payload, on_conflict="complaint_id").execute()
        logger.info("Synced complaint %s to Supabase.", payload["complaint_id"])
        return True
    except Exception as exc:
        logger.error("Error syncing complaint to Supabase: %s", exc)
        return False


def sync_history_to_supabase(
    complaint_id: str,
    action: str,
    previous_status: Optional[str] = None,
    new_status: Optional[str] = None,
    assigned_to: Optional[str] = None,
    changed_by: Optional[str] = None,
    notes: Optional[str] = None,
) -> bool:
    """Inserts an audit history row into Supabase."""
    client = get_supabase_client()
    if not client:
        return False

    try:
        payload = {
            "complaint_id": complaint_id,
            "action": action,
            "previous_status": previous_status,
            "new_status": new_status,
            "assigned_to": assigned_to,
            "changed_by": changed_by or "CareVoice System",
            "notes": notes,
        }
        client.table("complaint_history").insert(payload).execute()
        logger.info("Synced history for %s to Supabase.", complaint_id)
        return True
    except Exception as exc:
        logger.error("Error syncing history to Supabase: %s", exc)
        return False
