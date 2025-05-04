"""
Test scene API functionality.
"""

from fastapi.testclient import TestClient
from app.main import app
import uuid

client = TestClient(app)

def test_scenes_api():
    """Test scene creation, retrieval, and reordering."""
    # Test user context
    user_id = str(uuid.uuid4())
    
    # Create a test project first
    project_data = {
        "title": "Scene Test Project",
        "description": "A test project for scene API validation",
        "genre": "Mystery",
        "audience": "Adult",
        "writing_style": "Suspenseful",
        "story_length": "Novel"
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
    
    # Create character references
    character_data = {
        "name": "Detective Morgan",
        "traits": ["perceptive", "cynical", "determined"],
        "motivation": "To solve the case and find redemption",
        "project_id": project_id
    }
    
    response = client.post(
        "/characters/", 
        json=character_data,
        headers={"x-user-id": user_id}
    )
    assert response.status_code == 200
    character = response.json()
    character_id = character["id"]
    
    # Create a test scene
    scene_data = {
        "title": "The Discovery",
        "setting": "Abandoned warehouse at night",
        "mood": "Tense",
        "conflict": "Finding the first victim reveals a disturbing pattern",
        "characters": [character_id],
        "position": 1,
        "project_id": project_id
    }
    
    # Test scene creation
    response = client.post(
        "/scenes/", 
        json=scene_data,
        headers={"x-user-id": user_id}
    )
    assert response.status_code == 200
    scene = response.json()
    assert scene["title"] == scene_data["title"]
    assert scene["setting"] == scene_data["setting"]
    assert "id" in scene
    
    scene_id = scene["id"]
    
    # Create a second scene
    scene_data2 = {
        "title": "The Investigation",
        "setting": "Police station, early morning",
        "mood": "Focused",
        "conflict": "Evidence points to an unlikely suspect",
        "characters": [character_id],
        "position": 2,
        "project_id": project_id
    }
    
    response = client.post(
        "/scenes/", 
        json=scene_data2,
        headers={"x-user-id": user_id}
    )
    assert response.status_code == 200
    scene2 = response.json()
    scene2_id = scene2["id"]
    
    # Test scene listing
    response = client.get(
        f"/scenes/?project_id={project_id}",
        headers={"x-user-id": user_id}
    )
    assert response.status_code == 200
    scenes = response.json()
    assert len(scenes) >= 2
    
    # Test scene reordering
    reorder_data = {
        "scene_id": scene_id,
        "new_position": 3,
        "project_id": project_id
    }
    
    response = client.put(
        "/scenes/reorder",
        json=reorder_data,
        headers={"x-user-id": user_id}
    )
    assert response.status_code == 200
    
    # Verify reordering
    response = client.get(
        f"/scenes/?project_id={project_id}",
        headers={"x-user-id": user_id}
    )
    scenes = response.json()
    
    # Find our scenes in the list
    scene1_pos = next((s["position"] for s in scenes if s["id"] == scene_id), None)
    scene2_pos = next((s["position"] for s in scenes if s["id"] == scene2_id), None)
    
    assert scene1_pos == 3  # Our first scene should now be at position 3
    assert scene2_pos == 2  # Second scene should still be at position 2
