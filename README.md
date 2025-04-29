# 👻 Ghost-Writers.AI

### **Hackathon Details**

- **Hackathon Name:** LlamaCon Hackathon 2024
- **Location:** San Francisco, CA @ Shack15 / Cerebral Valley
- **Date:** May 3–4, 2024
- **Website/URL:** [LlamaCon Hackathon](https://cerebralvalley.ai/e/llamacon-hackathon-2025)
- **Objective:** Build an impactful, creative AI-powered tool within 24 hours, using sponsor tools like CrewAI, Groq, and Tavus.

# ![Ghost-Writers.AI Logo](static/Ghost-Writers-Logo.png)

## Overview

**Ghost-Writers.AI** empowers creative individuals to build structured fiction using modular AI tools. We combine character cards, scene design, AI memory, and real-time storytelling to help writers collaborate with AI, not compete with it.

Our demo showcases an intuitive writing platform backed by CrewAI agent teams, Groq's blazing-fast LLM inference, and Tavus-generated author interactions.

## Table of Contents

1. [Motivation](#motivation)
1. [Features](#features)
1. [Tech Stack](#tech-stack)
1. [Setup and Installation](#setup-and-installation)
1. [How It Works](#how-it-works)
1. [Challenges](#challenges)
1. [Future Improvements](#future-improvements)
1. [Contributors](#contributors)
1. [License](#license)
1. [Contact](#contact)

## Motivation

Writing a novel is overwhelming for many creatives. They struggle with structure, consistency, and momentum. Ghost-Writers.AI lowers the barrier to storytelling by offering structured tools and an AI collaboration framework that assists — not replaces — the human voice.

Ghost-Writers.AI uniquely combines agent orchestration, narrative memory, and modular creation tools to truly empower fiction writers.

## Features

- **Character Cards:** Define characters with background, traits, and motivations.
- **Scene Cards:** Build scenes with structured setting, conflict, and goals.
- **AI Memory:** Scene summaries are automatically remembered and influence future scenes.
- **CrewAI Agent Collaboration:** Modular agents like Plot Architect and Dialogue Polisher assist the writer.
- **Groq Fast Inference:** Lightning-speed scene generation for real-time creative flow.
- **Tavus Video:** Demo video showing fictional author-AI collaboration.

## Tech Stack

- **Frontend:** React.js (deployed via Vercel or local demo)
- **Backend:** FastAPI (Python)
- **Agent Orchestration:** CrewAI
- **LLM Inference:** Groq API (OpenRouter fallback)
- **Video Generation:** Tavus
- **Environment Management:** uv (via Homebrew)

## Setup and Installation

1. Clone the repository:

```bash
git clone https://github.com/your-repo/ghost-writers-ai.git
cd ghost-writers-ai
```

2. Install `uv` via Homebrew (MacOS):

```bash
brew install astral-sh/uv/uv
```

3. Sync environment dependencies:

```bash
uv sync
```

4. Add environment variables to `.env`:

```
GROQ_API_KEY=your-groq-api-key
TAVUS_API_KEY=your-tavus-api-key
CREWAI_API_KEY=your-crewai-key
```

5. Start backend server:

```bash
uv pip install fastapi uvicorn
uvicorn backend.server:app --reload
```

6. Run frontend (if local):

```bash
cd frontend
npm install
npm run dev
```

7. Access app at `http://localhost:3000`.

## How It Works

1. User creates character and scene cards.
2. User submits scene setup ➔ CrewAI agents generate scene drafts.
3. Groq API processes text generation for speed.
4. Scene summaries are captured by AI Memory Manager.
5. Tavus-generated video showcases fictional author collaboration.

## Challenges

- **Agent Coordination:** Structuring modular CrewAI agents to collaborate meaningfully.
- **Memory Handling:** Managing scene summaries across evolving narrative arcs.
- **Frontend-Backend Sync:** Rapid linking of React frontend to FastAPI endpoints.
- **Tight Deadline:** Focused on "working core" over feature sprawl.

## Future Improvements

- Richer worldbuilding templates (fantasy, sci-fi, etc.).
- Multiplayer collaborative writing rooms.
- Genre-specific AI writing personas.
- Deeper narrative memory across 10,000+ words.

## Contributors

- **Colin Alexander** - Backend & AI Engineer ([GitHub](https://github.com/colinalexander))
- **[Frontend Teammate]** - Frontend Developer _(Looking for you!)_

## License

This project is licensed under the MIT License.

## Contact

- **Discord:** alexander61239
