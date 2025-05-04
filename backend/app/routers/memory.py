"""
Memory router for Ghost-Writers.AI.
Implements memory storage and retrieval as described in BE-007.
"""

from fastapi import APIRouter, Request, Depends, HTTPException, Header, Query
from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

# Memory model schema
class MemoryBase(BaseModel):
    """Base memory model for shared attributes"""
    text: str
    category: Literal["Character", "Plot", "World", "Style"]

class MemoryCreate(MemoryBase):
    """Memory creation model"""
    scene_id: str
    project_id: str

class Memory(MemoryBase):
    """Memory response model with generated fields"""
    id: str
    scene_id: str
    project_id: str
    created_at: datetime
    
    class Config:
        orm_mode = True

# Stub implementation - will be replaced with database
memory_db = {}

@router.get("/{scene_id}", response_model=List[Memory])
async def get_memory(
    scene_id: str,
    x_user_id: Optional[str] = Header(None)
):
    """
    Get all memory entries for a specific scene.
    """
    if not x_user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    
    # Filter memory by scene_id
    scene_memory = [
        memory for memory in memory_db.values() 
        if memory.get("scene_id") == scene_id
    ]
    
    return scene_memory

@router.post("/", response_model=Memory)
async def create_memory(
    memory: MemoryCreate,
    x_user_id: Optional[str] = Header(None)
):
    """
    Create a new memory entry for a scene.
    """
    if not x_user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    
    # Generate unique ID and timestamp
    import uuid
    memory_id = str(uuid.uuid4())
    created_at = datetime.now()
    
    # Store memory with scene and project association
    new_memory = {
        "id": memory_id,
        "created_at": created_at,
        **memory.dict()
    }
    
    memory_db[memory_id] = new_memory
    
    return new_memory

@router.put("/{memory_id}", response_model=Memory)
async def update_memory(
    memory_id: str,
    memory_update: MemoryBase,
    x_user_id: Optional[str] = Header(None)
):
    """
    Update an existing memory entry.
    """
    if not x_user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    
    if memory_id not in memory_db:
        raise HTTPException(status_code=404, detail="Memory entry not found")
    
    # Update memory fields
    memory_db[memory_id].update(memory_update.dict())
    
    return memory_db[memory_id]
