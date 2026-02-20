"""
Tests for /health and /chat endpoints.
POST /chat test mocks Gemini so it runs without API quota.
"""

import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_get_health_returns_ok():
    """GET /health returns {\"status\": \"ok\"}."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@patch("gemini_chat.chat_with_maps")
def test_post_chat_returns_reply_and_non_null_widget_token(mock_chat):
    """POST /chat with a real message returns a reply and non-null widget_token."""
    mock_chat.return_value = {
        "reply": "Try **Taco Shop** — great carne asada. (4.5, $)",
        "widget_token": "mock-maps-widget-context-token-abc123",
    }
    response = client.post(
        "/chat",
        json={
            "message": "Best tacos near University of Arizona?",
            "lat": 32.2319,
            "lng": -110.9501,
            "history": [],
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert "widget_token" in data
    assert data["reply"] == mock_chat.return_value["reply"]
    assert data["widget_token"] is not None
    assert data["widget_token"] == "mock-maps-widget-context-token-abc123"
    mock_chat.assert_called_once()
    call_kw = mock_chat.call_args
    assert call_kw[0][0] == "Best tacos near University of Arizona?"
    assert call_kw[0][1] == 32.2319
    assert call_kw[0][2] == -110.9501
    assert call_kw[0][3] == []
