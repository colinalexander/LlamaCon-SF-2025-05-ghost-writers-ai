"""
Test memory API functionality.
"""

from fastapi.testclient import TestClient
from app.main import app
import uuid

client = TestClient(app)

def test_memory_api():
    """Test memory creation, retrieval, and updating."""
    # Test user context
    user_id = str(uuid.uuid4())
    
    # Create a test project first
    project_data = {
        "title": "Memory Test Project",
        "description": "A test project for memory API validation",
        "genre": "Fantasy",
        "audience": "Young Adult",
        "writing_style": "Descriptive",
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
    
    # Create a test scene
    scene_data = {
        "title": "The Ancient Forest",
        "setting": "Mysterious forest with ancient trees",
        "mood": "Magical",
        "conflict": "Discovering the forest's secret",
        "characters": [],
        "position": 1,
        "project_id": project_id
    }
    
    # Create scene
    response = client.post(
        "/scenes/", 
        json=scene_data,
        headers={"x-user-id": user_id}
    )
    assert response.status_code == 200
    scene = response.json()
    scene_id = scene["id"]
    
    # Create a test memory entry
    memory_data = {
        "text": "The ancient forest is home to magical creatures that only appear during full moons",
        "category": "World",
        "scene_id": scene_id,
        "project_id": project_id
    }
    
    # Test memory creation
    response = client.post(
        "/memory/", 
        json=memory_data,
        headers={"x-user-id": user_id}
    )
    assert response.status_code == 200
    memory = response.json()
    assert memory["text"] == memory_data["text"]
    assert memory["category"] == memory_data["category"]
    assert "id" in memory
    
    memory_id = memory["id"]
    
    # Test memory retrieval
    response = client.get(
        f"/memory/{scene_id}",
        headers={"x-user-id": user_id}
    )
    assert response.status_code == 200
    memories = response.json()
    assert len(memories) >= 1
    assert any(m["id"] == memory_id for m in memories)
    
    # Test memory update
    update_data = {
        "text": "The ancient forest is home to magical creatures that appear during both full moons and solar eclipses",
        "category": "World"
    }
    
    response = client.put(
        f"/memory/{memory_id}",
        json=update_data,
        headers={"x-user-id": user_id}
    )
    assert response.status_code == 200
    updated_memory = response.json()
    assert updated_memory["id"] == memory_id
    assert updated_memory["text"] == update_data["text"]
    
    # Verify update in retrieval
    response = client.get(
        f"/memory/{scene_id}",
        headers={"x-user-id": user_id}
    )
    memories = response.json()
    updated_memory_in_list = next((m for m in memories if m["id"] == memory_id), None)
    assert updated_memory_in_list is not None
    assert updated_memory_in_list["text"] == update_data["text"]
