"""
Projects router for Ghost-Writers.AI.
Implements project CRUD operations as described in BE-003.
"""

from fastapi import APIRouter, Request, Depends, HTTPException, Header
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

# Project model schema
class ProjectBase(BaseModel):
    """Base project model for shared attributes"""
    title: str
    description: str
    genre: str
    audience: str
    writing_style: str
    story_length: str

class ProjectCreate(ProjectBase):
    """Project creation model"""
    pass

class Project(ProjectBase):
    """Project response model with generated fields"""
    id: str
    created_at: datetime
    
    class Config:
        orm_mode = True

# In-memory project data store (will be replaced with database in implementation)
projects_db = {}

@router.get("/", response_model=List[Project])
async def get_projects(x_user_id: Optional[str] = Header(None)):
    """
    Get all projects for the current user.
    """
    if not x_user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    
    # Filter projects by user_id
    user_projects = [
        project for project in projects_db.values() 
        if project.get("user_id") == x_user_id
    ]
    
    return user_projects

@router.post("/", response_model=Project)
async def create_project(
    project: ProjectCreate, 
    x_user_id: Optional[str] = Header(None)
):
    """
    Create a new project with metadata.
    """
    if not x_user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    
    # Generate unique ID and timestamp
    import uuid
    project_id = str(uuid.uuid4())
    created_at = datetime.now()
    
    # Store project with user association
    new_project = {
        "id": project_id,
        "user_id": x_user_id,
        "created_at": created_at,
        **project.dict()
    }
    
    projects_db[project_id] = new_project
    
    return new_project

@router.get("/{project_id}", response_model=Project)
async def get_project(
    project_id: str,
    x_user_id: Optional[str] = Header(None)
):
    """
    Get a specific project by ID.
    """
    if not x_user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project = projects_db[project_id]
    
    # Verify user owns this project
    if project.get("user_id") != x_user_id:
        raise HTTPException(
            status_code=403, 
            detail="Not authorized to access this project"
        )
    
    return project
