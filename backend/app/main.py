"""
FastAPI main application for Ghost-Writers.AI backend.
Implements BE-001 with modular routing and project structure.
"""

import os
from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routers
from app.routers import (
    auth,
    projects,
    characters,
    scenes,
    memory,
    agents,
    export,
    tavus,
)

# Create FastAPI app
app = FastAPI(
    title="Ghost-Writers.AI API",
    description="Backend API for Ghost-Writers.AI fiction writing platform",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(projects.router, prefix="/projects", tags=["Projects"])
app.include_router(characters.router, prefix="/characters", tags=["Characters"])
app.include_router(scenes.router, prefix="/scenes", tags=["Scenes"])
app.include_router(memory.router, prefix="/memory", tags=["Memory"])
app.include_router(agents.router, prefix="/agents", tags=["Agents"])
app.include_router(export.router, prefix="/export", tags=["Export"])
app.include_router(tavus.router, prefix="/tavus", tags=["Tavus"])

@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Ghost-Writers.AI backend is running"}

@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Ghost-Writers.AI API",
        "docs": "/docs",
        "health": "/health",
    }
