## Ghost Writers AI - Implementation Tickets

## Tech Stack
- Next.js 14 with App Router
- Turso Database (SQLite-based, edge-ready database - DO NOT use Supabase)
- Tailwind CSS + shadcn/ui for styling and components
- Framer Motion for animations
- TipTap for rich text editing
- DnD Kit for drag and drop
- Lucide React for icons
- Y.js + WebSocket for real-time collaboration
- TypeScript for type safety
- Zod for schema validation

### Completed

#### FE-001 – Project Dashboard UI
- ✓ Display list of projects
- ✓ Create New Project modal with fields:
  - Title
  - Description
  - Genre
  - Audience
  - Style
  - Story length
- ✓ Enter Project button with global project_id storage
- ✓ API endpoints: GET /projects, POST /projects
- ✓ Error handling and loading states
- ✓ Database schema and initialization

#### FE-002 – Project Context Management
- ✓ Store project_id in global state
- ✓ Prevent scene/character access without context
- ✓ Pass project_id in all relevant requests
- ✓ UI and API scoped by project
- ✓ No orphaned content

#### FE-003 – Onboarding Wizard UI (3-Step Flow)
- ✓ Define Story: Genre, audience, style, story length
- ✓ Book Summary: Title, one-liner, tone
- ✓ Meet Your Coach: Auto-selected Tavus avatar + video
- ✓ Avatar chosen by genre
- ✓ Final state stored in /projects object

#### FE-004 – Character Card UI & CRUD
- ✓ Form and list view
- ✓ Fields: name, codename, traits, motivation, relationships
- ✓ Import shared characters
- ✓ Scoped by project_id
- ✓ Full create/edit/delete + import functionality

#### FE-005 – Scene Card UI & CRUD
- ✓ Form with title, setting, mood, conflict, characters
- ✓ Timeline card layout
- ✓ Drag-and-drop reorder
- ✓ Scene list reflects correct order
- ✓ Changes persisted via /scenes/reorder

#### FE-006 – Timeline View
- ✓ Vertical list of cards
- ✓ Drag handles
- ✓ Reorder tooltip
- ✓ Cards are movable
- ✓ UI reflects order + triggers reorder endpoint

#### FE-007 – Scene Generation UI
- ✓ Chapter length slider (500-5000 words, 100-word increments)
- ✓ Generation UI uses characters and memory
- ✓ Inline editable result
- ✓ Uses scoped memory
- ✓ Save or regenerate functionality
- ✓ Context tabs for characters and memory
- ✓ Loading states and error handling

#### FE-008 – Scene Editor with History & Save State
- ✓ Rich text editor with TipTap
- ✓ Auto-save with toggle
- ✓ Version history with restore capability
- ✓ Keyboard shortcuts (save, undo, redo, formatting)
- ✓ Real-time collaboration with Y.js
- ✓ Scene content persistence
- ✓ Unsaved changes warning

#### FE-009 – Memory Inspector UI
- ✓ Sections: Characters, World Facts, Plot Points, Style Notes
- ✓ Memory timeline per scene
- ✓ "New Memory Entry" modal
- ✓ Memory retrieval by scene_id
- ✓ Author fact editing

#### FE-010 – Tavus Avatar UI
- ✓ Display avatar video
- ✓ Show AI-generated script
- ✓ Genre-based avatar selection
- ✓ Integration with onboarding
- ✓ Dedicated video and script panel

#### FE-011 – Research Assistant
- ✓ Static research panel per scene
- ✓ Genre/scene title based suggestions
- ✓ 3-5 suggested topics display
- ✓ Info tooltips
- ✓ No external link integration

#### FE-012 – Long-Form Export Viewer
- ✓ Export button in Author Workspace
- ✓ Structured prompt output
- ✓ Scrollable + copy/downloadable view
- ✓ Include character cards, memory, and recent scenes
- ✓ Clean, readable format

#### FE-013 – Error Handling & Guardrails
- ✓ Block forms without project context
- ✓ Toast alerts for invalid requests
- ✓ Fallback messages
- ✓ Project_id validation
- ✓ Clear error surfacing

#### FE-014 – User Authentication & Project Ownership
- ✓ Sign-in and sign-up functionality
- ✓ Secure password storage with salt and hashing
- ✓ User-specific project listing
- ✓ Authentication middleware
- ✓ Project ownership with user_id
- ✓ Database migration system
- ✓ Redirect to sign-in from landing page
- ✓ Sign-out functionality

### Implementation Notes

Recent Updates:
- Added user authentication with secure password storage
- Implemented database migration system for schema updates
- Added user-specific project listing and ownership
- Enhanced sign-in/sign-up UI with better error handling
- Added password hashing with salt for security
- Fixed navigation between pages with proper authentication
- Added shared characters functionality with template system
- Implemented character import feature with pre-built archetypes
- Enhanced character management with full CRUD operations
- Completed project context management with proper scoping
- Added 3-step onboarding flow with genre-based coach selection
- Implemented scene management with drag-and-drop reordering
- Added vertical timeline view with drag-and-drop scene reordering
- Completed scene generation UI with memory and character context
- Added rich text editor with real-time collaboration and version history
- Implemented memory inspector with categorized entries and timeline
- Added Tavus avatar integration with genre-based personality
- Completed research assistant with genre-specific topic suggestions
- Added long-form export viewer with structured prompt output
- Implemented comprehensive error handling and form validation
