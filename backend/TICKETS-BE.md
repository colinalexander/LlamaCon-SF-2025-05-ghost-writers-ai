## Ghost Writers AI - Backend Implementation Tickets

### Completed

### In Progress

#### BE-001 – Project API & Backend Structure
Goal: Set up FastAPI backend with modular routing and metadata-aware projects
Tasks:
- Initialize FastAPI, CORS, health check, modular routers
- Create modules: auth, projects, characters, scenes, memory, agents, export, tavus
- Model: Project stores title, description, genre, audience, style, story_length
Acceptance Criteria:
- GET /health responds
- Server starts with uvicorn
- Modules load with no error

### To Do

#### BE-002 – User Session Stub
Goal: Simulate user context without full authentication
Tasks:
- Accept X-User-Id header
- Middleware injects into request
- Ensure all models are scoped by user_id and project_id
Acceptance Criteria:
- All routes scoped per user
- No cross-user data leakage

#### BE-003 – Project CRUD & Metadata
Goal: Store author intent from onboarding
Fields: title, description, genre, audience, writing_style, story_length, created_at
Endpoints:
- POST /projects
- GET /projects, GET /projects/{id}
Acceptance Criteria:
- Onboarding metadata persists
- Projects scope all downstream entities

#### BE-004 – Character Card CRUD
Goal: CRUD for characters scoped by project
Fields: name, codename, traits, motivation, relationships, is_shared, etc.
Endpoints:
- GET /characters?project_id=...
- POST /characters
- PUT /characters/{id}
- DELETE /characters/{id}
Acceptance Criteria:
- CRUD works with correct project scoping
- Shared character metadata included

#### BE-005 – Scene Card CRUD + Reordering
Goal: Define scenes and their order in the narrative
Fields: title, setting, mood, conflict, characters, position
Endpoints:
- GET /scenes?project_id=...
- POST /scenes, PUT /scenes/{id}, DELETE /scenes/{id}
- PUT /scenes/reorder
Acceptance Criteria:
- Scenes can be reordered and listed
- Position field controls timeline

#### BE-006 – Scene Generation via CrewAI
Goal: Generate contextual scene drafts with CrewAI
Tasks:
- POST /generate/scene uses: scene metadata, characters, memory, and length
- Output stored in scene_texts
- Hook for Llama API
Acceptance Criteria:
- Output reflects memory + length
- Generation stored and returned

#### BE-007 – Memory Storage & Inspector
Goal: Persist structured memory facts by category
Fields: scene_id, project_id, text, category (Character, Plot, World, Style)
Endpoints:
- GET /memory/{scene_id}
- POST /memory
- PUT /memory/{entry_id}
Acceptance Criteria:
- Memory saved per scene
- Can be manually edited or added

#### BE-008 – Tavus Avatar Script & Video API
Goal: Handle writing coach generation
Endpoints:
- POST /tavus/script generates from genre/audience
- POST /tavus/video returns video_id
Acceptance Criteria:
- Avatar video + script tied to project
- Script tone matches user input

#### BE-009 – Long-Form Prompt Export
Goal: Export structured prompt for LLMs
Tasks:
- Aggregate characters, memory, recent scenes
- Output to /export/llama_prompt
Acceptance Criteria:
- Output is complete and clean
- JSON or plaintext export supported

#### BE-010 – Shared Character Import
Goal: Enable character reuse across projects
Endpoints:
- GET /characters/shared
- POST /characters/import
Acceptance Criteria:
- Cloned characters show in target project
- Original source metadata retained

#### BE-011 – Admin & Dev Tools
Goal: Enable safe testing/resetting in dev
Endpoints:
- GET /debug/users, DELETE /debug/{user_id}
Acceptance Criteria:
- Tools gated by dev mode
- Data clearing restricted to non-production

### Optional Features

#### BE-012 – Scene Versioning and History
Goal: Track all scene generations
Tasks:
- New scene_versions table
- Update /generate/scene to append versions
- GET /scenes/{id}/versions
Acceptance Criteria:
- Past versions are retrievable
- Latest version shown by default

#### BE-013 – Memory Recompute Endpoint
Goal: Regenerate memory from scene text
Endpoint:
- POST /memory/recompute
Acceptance Criteria:
- Response structured like regular memory
- Doesn't auto-persist unless requested

#### BE-014 – Timeline Memory Diff
Goal: Show what changed in memory between two scenes
Endpoint:
- POST /memory/diff?scene_a=...&scene_b=...
Acceptance Criteria:
- Output contains added, removed, changed memory entries

#### BE-015 – Auto-Generated Character Summaries
Goal: Generate backstories or motivations from traits
Endpoint:
- POST /generate/character_summary
Acceptance Criteria:
- Output resembles editable character card

#### BE-016 – Writing Style Injection
Goal: Inject style/persona metadata into generation
Update:
- Add writing_style to /generate/scene input
Acceptance Criteria:
- Output reflects tone (e.g., "Tom Clancy")
- Defaults if unspecified

### Implementation Notes

Current stack:
- FastAPI
- CrewAI for scene generation
- Llama API
- SQLite for development
- PostgreSQL for production