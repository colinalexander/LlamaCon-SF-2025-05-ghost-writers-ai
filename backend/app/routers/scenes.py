"""
Scenes router for Ghost-Writers.AI.
Implements scene management as described in BE-005.
"""

from fastapi import APIRouter, Request, Depends, HTTPException, Header, Query
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime

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
