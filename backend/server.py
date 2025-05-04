"""
Ghost-Writers.AI Server

This module serves as the main entry point for the FastAPI backend server.
It imports and runs the FastAPI application defined in app/main.py.
"""

import uvicorn
from app.main import app

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
