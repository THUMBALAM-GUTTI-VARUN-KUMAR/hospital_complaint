"""Tests for Complaints API endpoints."""

import re


def test_create_web_complaint(client):
    payload = {
        "patient_name": "Ramesh Kumar",
        "contact_number": "+91-9876543210",
        "department": "Emergency",
        "category": "Waiting Time",
        "priority": "High",
        "source": "web",
        "description": "Patient waited over 2 hours in the triage area without vital assessment.",
    }
    response = client.post("/api/complaints", json=payload)
    assert response.status_code == 201
    data = response.json()

    assert "complaint_id" in data
    # Check ID format CV-YYYY-0001
    assert re.match(r"^CV-\d{4}-\d{4}$", data["complaint_id"])
    assert data["patient_name"] == "Ramesh Kumar"
    assert data["department"] == "Emergency"
    assert data["status"] == "Pending"
    assert data["source"] == "web"
    assert len(data["history"]) >= 1
    assert data["history"][0]["action"] == "COMPLAINT_CREATED"


def test_create_voice_call_complaint(client):
    payload = {
        "patient_name": "Sunita Devi",
        "contact_number": "+91-9123456789",
        "department": "Pharmacy",
        "category": "Medication Shortage",
        "priority": "Critical",
        "source": "voice_call",
        "description": "Prescribed hypertension medicine was out of stock at the central counter.",
        "call_recording_url": "https://storage.carevoice.org/audio/call-9921.mp3",
        "transcript": "Caller reported that pharmacy told them medicines are unavailable.",
    }
    response = client.post("/api/complaints", json=payload)
    assert response.status_code == 201
    data = response.json()

    assert data["source"] == "voice_call"
    assert data["call_recording_url"] == "https://storage.carevoice.org/audio/call-9921.mp3"
    assert "Caller reported" in data["transcript"]


def test_complaint_id_sequential_generation(client):
    res1 = client.post(
        "/api/complaints",
        json={
            "patient_name": "Test Citizen 1",
            "department": "OPD",
            "category": "Billing",
            "description": "Overcharged for consultation slip.",
        },
    )
    res2 = client.post(
        "/api/complaints",
        json={
            "patient_name": "Test Citizen 2",
            "department": "OPD",
            "category": "Billing",
            "description": "Double deduction via UPI payment.",
        },
    )
    id1 = res1.json()["complaint_id"]
    id2 = res2.json()["complaint_id"]

    seq1 = int(id1.split("-")[-1])
    seq2 = int(id2.split("-")[-1])
    assert seq2 == seq1 + 1


def test_get_complaint_by_id(client):
    create_res = client.post(
        "/api/complaints",
        json={
            "patient_name": "Anita Verma",
            "department": "Housekeeping",
            "category": "Sanitation",
            "description": "Ward 4 restrooms are unhygienic.",
        },
    )
    cid = create_res.json()["complaint_id"]

    get_res = client.get(f"/api/complaints/{cid}")
    assert get_res.status_code == 200
    assert get_res.json()["complaint_id"] == cid
    assert get_res.json()["patient_name"] == "Anita Verma"


def test_get_complaint_not_found(client):
    response = client.get("/api/complaints/CV-1999-9999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_update_complaint_status(client):
    create_res = client.post(
        "/api/complaints",
        json={
            "patient_name": "Vikram Singh",
            "department": "Radiology",
            "category": "Equipment",
            "description": "CT Scan machine out of order.",
        },
    )
    cid = create_res.json()["complaint_id"]

    # Transition to In Progress
    patch_res = client.patch(
        f"/api/complaints/{cid}/status",
        json={
            "status": "In Progress",
            "changed_by": "Dr. Mehta",
            "notes": "Technician dispatched to calibrate scanner.",
        },
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "In Progress"

    # Transition to Resolved
    resolve_res = client.patch(
        f"/api/complaints/{cid}/status",
        json={
            "status": "Resolved",
            "changed_by": "Dr. Mehta",
            "resolution_notes": "Scanner recalibrated and operational.",
        },
    )
    assert resolve_res.status_code == 200
    assert resolve_res.json()["status"] == "Resolved"
    assert resolve_res.json()["resolution_notes"] == "Scanner recalibrated and operational."

    # Verify history timeline
    get_res = client.get(f"/api/complaints/{cid}")
    history = get_res.json()["history"]
    actions = [h["action"] for h in history]
    assert "STATUS_CHANGED" in actions


def test_assign_complaint(client):
    create_res = client.post(
        "/api/complaints",
        json={
            "patient_name": "Pooja Sharma",
            "department": "Cardiology",
            "category": "Doctor Availability",
            "description": "Senior cardiologist was not available during scheduled hours.",
        },
    )
    cid = create_res.json()["complaint_id"]

    assign_res = client.patch(
        f"/api/complaints/{cid}/assign",
        json={
            "assigned_to": "Dr. A. K. Gupta",
            "assigned_department": "Cardiology Wing B",
            "changed_by": "Medical Superintendent",
            "notes": "Assigning for internal departmental inquiry.",
        },
    )
    assert assign_res.status_code == 200
    data = assign_res.json()
    assert data["assigned_to"] == "Dr. A. K. Gupta"
    assert data["assigned_department"] == "Cardiology Wing B"
    assert data["status"] == "In Progress"  # Auto-transitioned from Pending


def test_list_complaints_with_filtering(client):
    client.post(
        "/api/complaints",
        json={
            "patient_name": "Filter Test 1",
            "department": "Pediatrics",
            "category": "Staff",
            "source": "web",
            "description": "Nurse behavior was uncooperative.",
        },
    )
    client.post(
        "/api/complaints",
        json={
            "patient_name": "Filter Test 2",
            "department": "Oncology",
            "category": "Billing",
            "source": "voice_call",
            "description": "Delay in insurance claim processing.",
        },
    )

    # Filter by department
    res_dept = client.get("/api/complaints?department=Pediatrics")
    assert res_dept.status_code == 200
    assert all(c["department"] == "Pediatrics" for c in res_dept.json())

    # Filter by source
    res_source = client.get("/api/complaints?source=voice_call")
    assert res_source.status_code == 200
    assert any(c["source"] == "voice_call" for c in res_source.json())

    # Search filter
    res_search = client.get("/api/complaints?search=insurance")
    assert res_search.status_code == 200
    assert any("insurance" in c["description"].lower() for c in res_search.json())
