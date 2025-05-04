"""
Test health endpoint functionality.
"""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    """Test that health endpoint returns 200 and correct data."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "message": "Ghost-Writers.AI backend is running"}
