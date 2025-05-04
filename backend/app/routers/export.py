"""
Export router for Ghost-Writers.AI.
Implements export functionality as described in BE-009.
"""

from fastapi import APIRouter, Request, Depends, HTTPException, Header, Query
from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

# Export model schema
class ExportRequest(BaseModel):
    """Export request model"""
    project_id: str
    format: Literal["json", "plaintext"] = "json"
    include_characters: bool = True
    include_scenes: bool = True
    include_memory: bool = True
    max_scenes: int = 10

class ExportResponse(BaseModel):
    """Export response model"""
    project_id: str
    export_id: str
    content: str
    format: str
    created_at: datetime
    metadata: Dict[str, Any]

@router.post("/llama_prompt", response_model=ExportResponse)
async def export_llama_prompt(
    request: ExportRequest,
    x_user_id: Optional[str] = Header(None)
):
    """
    Export structured prompt for LLMs.
    Aggregates characters, memory, and recent scenes.
    """
    if not x_user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    
    # This is a placeholder for the actual export implementation
    # In the actual implementation, we would:
    # 1. Retrieve project data, character data, scene data, and memory data
    # 2. Format the data according to the requested format
    # 3. Return the formatted data
    
    import uuid
    import json
    
    # Mock export data (this will be replaced with actual project data)
    mock_project = {
        "title": "The Haunted Lighthouse",
        "genre": "Mystery/Thriller",
        "audience": "Young Adult"
    }
    
    mock_characters = [
        {"name": "Emma Chen", "traits": ["curious", "intelligent", "fearless"]},
        {"name": "Oliver Reed", "traits": ["skeptical", "protective", "analytical"]}
    ]
    
    mock_scenes = [
        {"title": "The Discovery", "setting": "Abandoned lighthouse", "mood": "eerie"},
        {"title": "The Investigation", "setting": "Coastal village", "mood": "tense"}
    ]
    
    mock_memory = [
        {"category": "World", "text": "The lighthouse has been abandoned for 50 years"},
        {"category": "Plot", "text": "Emma found a mysterious diary in the lighthouse keeper's quarters"}
    ]
    
    # Create export data structure
    export_data = {
        "project": mock_project,
        "characters": mock_characters if request.include_characters else [],
        "scenes": mock_scenes if request.include_scenes else [],
        "memory": mock_memory if request.include_memory else []
    }
    
    # Format export data
    if request.format == "json":
        content = json.dumps(export_data, indent=2)
    else:  # plaintext
        content = f"""
        Project: {mock_project['title']} ({mock_project['genre']} for {mock_project['audience']})
        
        Characters:
        {chr(10).join([f"- {char['name']}: {', '.join(char['traits'])}" for char in mock_characters]) if request.include_characters else "None included"}
        
        Scenes:
        {chr(10).join([f"- {scene['title']} ({scene['mood']} - {scene['setting']})" for scene in mock_scenes]) if request.include_scenes else "None included"}
        
        Memory:
        {chr(10).join([f"- {mem['category']}: {mem['text']}" for mem in mock_memory]) if request.include_memory else "None included"}
        """
    
    # Create response
    response = {
        "project_id": request.project_id,
        "export_id": str(uuid.uuid4()),
        "content": content,
        "format": request.format,
        "created_at": datetime.now(),
        "metadata": {
            "included_characters": len(mock_characters) if request.include_characters else 0,
            "included_scenes": len(mock_scenes) if request.include_scenes else 0,
            "included_memory": len(mock_memory) if request.include_memory else 0
        }
    }
    
    return response
