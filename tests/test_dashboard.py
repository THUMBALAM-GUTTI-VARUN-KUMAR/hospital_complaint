"""Tests for Dashboard Statistics API endpoint."""


def test_dashboard_stats_endpoint(client):
    # Seed complaints
    client.post(
        "/api/complaints",
        json={
            "patient_name": "Dash User 1",
            "department": "Emergency",
            "category": "Waiting Time",
            "priority": "High",
            "source": "web",
            "description": "Long emergency queue.",
        },
    )
    client.post(
        "/api/complaints",
        json={
            "patient_name": "Dash User 2",
            "department": "Pharmacy",
            "category": "Medication",
            "priority": "Critical",
            "source": "voice_call",
            "description": "Shortage of antibiotics.",
        },
    )

    # Seed feedback
    client.post(
        "/api/feedback",
        json={
            "patient_name": "Dash User 1",
            "rating": 5,
            "comments": "Great triage response.",
        },
    )
    client.post(
        "/api/feedback",
        json={
            "patient_name": "Dash User 2",
            "rating": 3,
            "comments": "Average response time.",
        },
    )

    response = client.get("/api/dashboard/stats")
    assert response.status_code == 200
    data = response.json()

    assert data["total_complaints"] >= 2
    assert data["web_complaints"] >= 1
    assert data["voice_call_complaints"] >= 1
    assert data["total_feedback_count"] >= 2
    assert 1.0 <= data["average_feedback_rating"] <= 5.0
    assert "Emergency" in data["department_breakdown"]
    assert "Pharmacy" in data["department_breakdown"]
    assert len(data["recent_complaints"]) >= 1
