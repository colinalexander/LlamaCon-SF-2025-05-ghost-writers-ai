"""
Tavus router for Ghost-Writers.AI.
Implements Tavus avatar integration as described in BE-008.
"""

from fastapi import APIRouter, Request, Depends, HTTPException, Header, Query
from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel
from datetime import datetime
import os
import json

router = APIRouter()

# Tavus model schema
class ScriptGenerateRequest(BaseModel):
    """Script generation request model"""
    project_id: str
    genre: str
    audience: str
    tone: Optional[str] = "encouraging"
    length: Optional[int] = 60  # seconds

class ScriptGenerateResponse(BaseModel):
    """Script generation response model"""
    project_id: str
    script: str
    estimated_duration: int
    tone: str
    created_at: datetime

class VideoGenerateRequest(BaseModel):
    """Video generation request model"""
    project_id: str
    script: str
    avatar_style: Optional[str] = "professional"

class VideoGenerateResponse(BaseModel):
    """Video generation response model"""
    project_id: str
    video_id: str
    status: str
    url: Optional[str] = None
    created_at: datetime

class ConversationRequest(BaseModel):
    """Conversation creation request model"""
    project_id: str
    genre: str
    user_name: Optional[str] = None

class ConversationResponse(BaseModel):
    """Conversation creation response model"""
    project_id: str
    conversation_id: str
    conversation_url: str
    genre: str
    created_at: datetime

class TranscriptWebhookRequest(BaseModel):
    """Transcript webhook request model"""
    event: str
    conversation_id: str
    transcript: Dict[str, Any]

@router.post("/script", response_model=ScriptGenerateResponse)
async def generate_script(
    request: ScriptGenerateRequest,
    x_user_id: Optional[str] = Header(None)
):
    """
    Generate a coach script based on genre and audience.
    """
    if not x_user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    
    # In the actual implementation, we might use LLM to generate appropriate scripts
    # based on genre, audience, and tone
    
    # For now, we'll use a simple template approach
    script_templates = {
        "fantasy": "Welcome to your fantasy writing journey! Let's create magical worlds together. Remember, every great fantasy story balances wonder with believable characters.",
        "mystery": "Crafting a mystery requires careful planning and subtle clues. As your writing coach, I'll help you navigate the twists and turns of your plot.",
        "romance": "Romance writing is about emotional connection. Focus on creating authentic characters whose relationship growth feels earned and meaningful.",
        "sci-fi": "Science fiction allows us to explore big ideas through compelling stories. Remember to ground your technology in enough reality to maintain believability."
    }
    
    # Get the appropriate script template based on genre
    genre_key = request.genre.lower() if request.genre else "fantasy"
    if genre_key not in script_templates:
        genre_key = "fantasy"  # default
        
    base_script = script_templates[genre_key]
    
    # Adapt to audience
    audience_adaption = {
        "young adult": " Keep your language accessible and themes relatable to younger readers.",
        "adult": " Don't shy away from complex themes and nuanced character development.",
        "children": " Focus on clear storytelling and positive messaging."
    }
    
    audience_key = request.audience.lower() if request.audience else ""
    if audience_key in audience_adaption:
        base_script += audience_adaption[audience_key]
    
    # Add tone-specific ending
    tone_ending = {
        "encouraging": " I believe in your creative vision. Let's make it happen!",
        "analytical": " Let's analyze your narrative structure to optimize reader engagement.",
        "friendly": " I'm excited to collaborate with you on this writing adventure!"
    }
    
    tone_key = request.tone.lower() if request.tone else "encouraging"
    if tone_key in tone_ending:
        base_script += tone_ending[tone_key]
    
    # Create response
    response = {
        "project_id": request.project_id,
        "script": base_script,
        "estimated_duration": len(base_script.split()) // 2,  # rough estimate
        "tone": request.tone,
        "created_at": datetime.now()
    }
    
    return response

@router.post("/video", response_model=VideoGenerateResponse)
async def generate_video(
    request: VideoGenerateRequest,
    x_user_id: Optional[str] = Header(None)
):
    """
    Generate a Tavus avatar video using the script.
    """
    if not x_user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    
    # Check for Tavus API key
    tavus_api_key = os.getenv("TAVUS_API_KEY")
    if not tavus_api_key:
        raise HTTPException(status_code=500, detail="Tavus API key not configured")
    
    # In the actual implementation, we would:
    # 1. Call the Tavus API to generate a video
    # 2. Store the video ID and other metadata
    # 3. Return the video information
    
    import uuid
    
    # Mock response for now
    response = {
        "project_id": request.project_id,
        "video_id": str(uuid.uuid4()),
        "status": "processing",  # In a real implementation, this would be the actual status from Tavus
        "created_at": datetime.now()
    }
    
    return response

@router.post("/conversation", response_model=ConversationResponse)
async def create_conversation(
    request: ConversationRequest,
    x_user_id: Optional[str] = Header(None)
):
    """
    Create a Tavus conversation with a writing coach.
    """
    if not x_user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    
    # Check for Tavus API key
    tavus_api_key = os.getenv("TAVUS_API_KEY")
    if not tavus_api_key:
        raise HTTPException(status_code=500, detail="Tavus API key not configured")
    
    # Load genre configuration from tavus-prompts.json
    try:
        with open("tavus-prompts.json", "r") as f:
            tavus_prompts = json.load(f)
        
        genre_key = request.genre.lower() if request.genre else "fantasy"
        if genre_key not in tavus_prompts["genres"]:
            raise HTTPException(status_code=400, detail=f"Invalid genre: {genre_key}")
        
        genre_config = tavus_prompts["genres"][genre_key]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading genre configuration: {str(e)}")
    
    # Create a webhook URL for receiving transcripts
    # This should be a publicly accessible URL that points to your transcript endpoint
    webhook_url = os.getenv("APP_URL", "https://your-domain.com") + "/api/tavus/transcript-webhook"
    
    # In the actual implementation, we would:
    # 1. Call the Tavus API to create a conversation
    # 2. Store the conversation ID and other metadata
    # 3. Return the conversation information
    
    import uuid
    
    # Mock response for now
    conversation_id = str(uuid.uuid4())
    conversation_url = f"https://tavus.daily.co/{conversation_id}"
    
    response = {
        "project_id": request.project_id,
        "conversation_id": conversation_id,
        "conversation_url": conversation_url,
        "genre": request.genre,
        "created_at": datetime.now()
    }
    
    return response

@router.post("/transcript-webhook", status_code=200)
async def transcript_webhook(
    request: TranscriptWebhookRequest
):
    """
    Webhook endpoint for receiving conversation transcripts.
    """
    if request.event != "application.transcription_ready":
        return {"status": "ignored"}
    
    try:
        # Store the transcript in your database
        # This could be in a dedicated transcripts table
        # or as part of the project data
        
        # Example implementation:
        # await db.execute(
        #     """
        #     INSERT INTO conversation_transcripts (conversation_id, transcript, created_at)
        #     VALUES ($1, $2, $3)
        #     """,
        #     request.conversation_id,
        #     json.dumps(request.transcript),
        #     datetime.now()
        # )
        
        return {"status": "success"}
    except Exception as e:
        print(f"Error processing transcript webhook: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process transcript")
