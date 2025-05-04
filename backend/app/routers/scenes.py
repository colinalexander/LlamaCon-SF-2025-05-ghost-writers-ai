"""
Scenes router for Ghost-Writers.AI.
Implements scene management as described in BE-005.
"""

from fastapi import APIRouter, Request, Depends, HTTPException, Header, Query
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime
import uuid

router = APIRouter()

# Scene model schema
class SceneBase(BaseModel):
    """Base scene model for shared attributes"""
    title: str
    setting: str
    mood: str
    conflict: str
    characters: List[str]
    position: int

class SceneCreate(SceneBase):
    """Scene creation model"""
    project_id: str

class Scene(SceneBase):
    """Scene response model with generated fields"""
    id: str
    project_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class SceneReorder(BaseModel):
    """Scene reordering model"""
    scene_id: str
    new_position: int
    project_id: str

# Stub implementation - will be replaced with database
scenes_db = {}
# Stub for scene history storage - will be replaced with database
scene_history_db = {}

@router.get("/", response_model=List[Scene])
async def get_scenes(
    project_id: str = Query(..., description="Project ID"),
    x_user_id: Optional[str] = Header(None)
):
    """
    Get all scenes for a specific project.
    """
    if not x_user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    
    # Filter scenes by project_id
    project_scenes = [
        scene for scene in scenes_db.values() 
        if scene.get("project_id") == project_id
    ]
    
    # Sort by position
    project_scenes.sort(key=lambda x: x.get("position", 0))
    
    return project_scenes

@router.post("/", response_model=Scene)
async def create_scene(
    scene: SceneCreate,
    x_user_id: Optional[str] = Header(None)
):
    """
    Create a new scene for a project.
    """
    if not x_user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    
    # Generate unique ID and timestamp
    import uuid
    scene_id = str(uuid.uuid4())
    created_at = datetime.now()
    
    # Store scene with project association
    new_scene = {
        "id": scene_id,
        "created_at": created_at,
        **scene.dict()
    }
    
    scenes_db[scene_id] = new_scene
    
    return new_scene

@router.put("/reorder", response_model=Dict[str, Any])
async def reorder_scenes(
    reorder: SceneReorder,
    x_user_id: Optional[str] = Header(None)
):
    """
    Reorder scenes by updating their positions.
    """
    if not x_user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    
    scene_id = reorder.scene_id
    if scene_id not in scenes_db:
        raise HTTPException(status_code=404, detail="Scene not found")
    
    # Update scene position
    scenes_db[scene_id]["position"] = reorder.new_position
    
    return {"message": "Scene position updated", "scene_id": scene_id, "new_position": reorder.new_position}

# Scene content models for history tracking
class SceneContent(BaseModel):
    """Model for scene content updates"""
    content: str
    
class SceneContentHistory(BaseModel):
    """Model for scene content history entries"""
    content: str
    timestamp: datetime
    
    class Config:
        from_attributes = True

@router.post("/{scene_id}/content", response_model=Dict[str, Any])
async def update_scene_content(
    scene_id: str,
    content_update: SceneContent,
    project_id: str = Query(..., description="Project ID"),
    x_user_id: Optional[str] = Header(None)
):
    """
    Update scene content and record in history.
    """
    if not x_user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    
    if scene_id not in scenes_db:
        raise HTTPException(status_code=404, detail="Scene not found")
    
    # Check project association
    if scenes_db[scene_id].get("project_id") != project_id:
        raise HTTPException(status_code=403, detail="Scene does not belong to specified project")
    
    # Create history entry
    timestamp = datetime.now()
    history_id = str(uuid.uuid4())
    
    history_entry = {
        "id": history_id,
        "scene_id": scene_id,
        "project_id": project_id,
        "content": content_update.content,
        "timestamp": timestamp
    }
    
    # Initialize history array for this scene if it doesn't exist
    if scene_id not in scene_history_db:
        scene_history_db[scene_id] = []
    
    # Add to history
    scene_history_db[scene_id].append(history_entry)
    
    # Update scene content (would normally be in a separate field)
    if "content" not in scenes_db[scene_id]:
        scenes_db[scene_id]["content"] = content_update.content
    else:
        scenes_db[scene_id]["content"] = content_update.content
    
    return {"message": "Scene content updated", "scene_id": scene_id, "timestamp": timestamp}

@router.get("/{scene_id}/history", response_model=List[SceneContentHistory])
async def get_scene_history(
    scene_id: str,
    project_id: str = Query(..., description="Project ID"),
    x_user_id: Optional[str] = Header(None)
):
    """
    Get history of content updates for a scene.
    """
    if not x_user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    
    if scene_id not in scenes_db:
        raise HTTPException(status_code=404, detail="Scene not found")
    
    # Check project association
    if scenes_db[scene_id].get("project_id") != project_id:
        raise HTTPException(status_code=403, detail="Scene does not belong to specified project")
    
    # Get history for scene
    history = scene_history_db.get(scene_id, [])
    
    # Sort by timestamp, newest first
    history.sort(key=lambda x: x.get("timestamp"), reverse=True)
    
    return history
