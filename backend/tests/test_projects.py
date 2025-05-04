"""
Test project API functionality.
"""

from fastapi.testclient import TestClient
from app.main import app
import uuid

client = TestClient(app)

def test_projects_api():
    """Test project creation and retrieval."""
    # Test user context
    user_id = str(uuid.uuid4())
    
    # Create a test project
    project_data = {
        "title": "Test Project",
        "description": "A test project for API validation",
        "genre": "Science Fiction",
        "audience": "Young Adult",
        "writing_style": "Descriptive",
        "story_length": "Novel"
    }
    
    # Test project creation
    response = client.post(
        "/projects/", 
        json=project_data,
        headers={"x-user-id": user_id}
    )
    assert response.status_code == 200
    project = response.json()
    assert project["title"] == project_data["title"]
    assert project["genre"] == project_data["genre"]
    assert "id" in project
    
    project_id = project["id"]
    
    # Test project retrieval by ID
    response = client.get(
        f"/projects/{project_id}",
        headers={"x-user-id": user_id}
    )
    assert response.status_code == 200
    retrieved_project = response.json()
    assert retrieved_project["id"] == project_id
    assert retrieved_project["title"] == project_data["title"]
    
    # Test project listing
    response = client.get(
        "/projects/",
        headers={"x-user-id": user_id}
    )
    assert response.status_code == 200
    projects = response.json()
    assert len(projects) >= 1
    assert any(p["id"] == project_id for p in projects)
    
    # Test authorization - should fail with different user
    other_user_id = str(uuid.uuid4())
    response = client.get(
        f"/projects/{project_id}",
        headers={"x-user-id": other_user_id}
    )
    assert response.status_code == 403  # Forbidden
