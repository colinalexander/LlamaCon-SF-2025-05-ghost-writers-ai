"""
Authentication router for Ghost-Writers.AI.
For now, this implements a simple user session stub as described in BE-002.
"""

from fastapi import APIRouter, Request, Depends, HTTPException, Header
from typing import Optional

router = APIRouter()

@router.get("/session")
async def get_session(x_user_id: Optional[str] = Header(None)):
    """
    Get current user session information.
    This is a stub implementation that will be expanded in BE-002.
    """
    if not x_user_id:
        raise HTTPException(status_code=401, detail="No user ID provided")
    
    return {
        "user_id": x_user_id,
        "authenticated": True,
        "session_type": "development"
    }
