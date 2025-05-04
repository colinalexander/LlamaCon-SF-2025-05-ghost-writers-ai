"""
Characters router for Ghost-Writers.AI.
Implements character CRUD operations as described in BE-004.
"""

from fastapi import APIRouter, Request, Depends, HTTPException, Header, Query
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

# Character model schema
class CharacterBase(BaseModel):
    """Base character model for shared attributes"""
    name: str
    codename: Optional[str] = None
    traits: List[str]
    motivation: str
    background: Optional[str] = None
    relationships: Optional[Dict[str, str]] = None
    is_shared: bool = False

class CharacterCreate(CharacterBase):
    """Character creation model"""
    project_id: str

class Character(CharacterBase):
    """Character response model with generated fields"""
    id: str
    project_id: str
    created_at: datetime
    
    class Config:
        orm_mode = True

# Stub implementation - will be replaced with database
characters_db = {}

@router.get("/", response_model=List[Character])
async def get_characters(
    project_id: str = Query(..., description="Project ID"),
    x_user_id: Optional[str] = Header(None)
):
    """
    Get all characters for a specific project.
    """
    if not x_user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    
    # Filter characters by project_id
    project_characters = [
        character for character in characters_db.values() 
        if character.get("project_id") == project_id
    ]
    
    return project_characters

@router.post("/", response_model=Character)
async def create_character(
    character: CharacterCreate,
    x_user_id: Optional[str] = Header(None)
):
    """
    Create a new character for a project.
    """
    if not x_user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    
    # Generate unique ID and timestamp
    import uuid
    character_id = str(uuid.uuid4())
    created_at = datetime.now()
    
    # Store character with project association
    new_character = {
        "id": character_id,
        "created_at": created_at,
        **character.dict()
    }
    
    characters_db[character_id] = new_character
    
    return new_character
