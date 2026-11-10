"""Tests for Feedback API endpoints."""


def test_submit_general_feedback(client):
    payload = {
        "patient_name": "Suresh Raina",
        "rating": 4,
        "comments": "Staff was helpful and guided us to the right counter.",
        "service_aspect": "Staff Courtesy",
    }
    response = client.post("/api/feedback", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["rating"] == 4
    assert data["patient_name"] == "Suresh Raina"
    assert data["complaint_id"] is None


def test_submit_feedback_linked_to_complaint(client):
    create_res = client.post(
        "/api/complaints",
        json={
            "patient_name": "Kavita Roy",
            "department": "Billing",
            "category": "Refund",
            "description": "Deposit refund delayed.",
        },
    )
    cid = create_res.json()["complaint_id"]

    feedback_payload = {
        "complaint_id": cid,
        "rating": 5,
        "comments": "Resolved within 24 hours, thank you!",
        "service_aspect": "Resolution Speed",
    }
    response = client.post("/api/feedback", json=feedback_payload)
    assert response.status_code == 201
    data = response.json()
    assert data["complaint_id"] == cid
    assert data["rating"] == 5

    # Check that feedback event was appended to complaint timeline
    comp_res = client.get(f"/api/complaints/{cid}")
    actions = [h["action"] for h in comp_res.json()["history"]]
    assert "FEEDBACK_RECEIVED" in actions


def test_submit_feedback_invalid_complaint_id(client):
    payload = {
        "complaint_id": "CV-1999-0000",
        "rating": 5,
        "comments": "Non-existent complaint test.",
    }
    response = client.post("/api/feedback", json=payload)
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_submit_feedback_invalid_rating(client):
    payload = {
        "rating": 10,  # Max allowed is 5
        "comments": "Out of range rating.",
    }
    response = client.post("/api/feedback", json=payload)
    assert response.status_code == 422


def test_list_feedback(client):
    client.post(
        "/api/feedback",
        json={
            "patient_name": "Feedback Lister",
            "rating": 4,
            "comments": "Clean premises.",
        },
    )
    response = client.get("/api/feedback")
    assert response.status_code == 200
    assert len(response.json()) >= 1
