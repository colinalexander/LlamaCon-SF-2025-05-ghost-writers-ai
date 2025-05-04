"""
Test character API functionality.
"""

from fastapi.testclient import TestClient
from app.main import app
import uuid

client = TestClient(app)

def test_characters_api():
    """Test character creation and retrieval."""
    # Test user context
    user_id = str(uuid.uuid4())
    
    # Create a test project first
    project_data = {
        "title": "Character Test Project",
        "description": "A test project for character API validation",
        "genre": "Fantasy",
        "audience": "Adult",
        "writing_style": "Engaging",
        "story_length": "Novella"
    }
    
    # Create project
    response = client.post(
        "/projects/", 
        json=project_data,
        headers={"x-user-id": user_id}
    )
    assert response.status_code == 200
    project = response.json()
    project_id = project["id"]
    
    # Create a test character
    character_data = {
        "name": "Elara Nightwind",
        "codename": "The Shadow",
        "traits": ["mysterious", "intelligent", "resourceful"],
        "motivation": "To uncover the truth about her family's disappearance",
        "background": "Raised in the streets of Ravenhold after her family vanished",
        "relationships": {"Marius": "Mentor", "Thorne": "Rival"},
        "is_shared": False,
        "project_id": project_id
    }
    
    # Test character creation
    response = client.post(
        "/characters/", 
        json=character_data,
        headers={"x-user-id": user_id}
    )
    assert response.status_code == 200
    character = response.json()
    assert character["name"] == character_data["name"]
    assert character["traits"] == character_data["traits"]
    assert "id" in character
    
    character_id = character["id"]
    
    # Test character listing
    response = client.get(
        f"/characters/?project_id={project_id}",
        headers={"x-user-id": user_id}
    )
    assert response.status_code == 200
    characters = response.json()
    assert len(characters) >= 1
    assert any(c["id"] == character_id for c in characters)
