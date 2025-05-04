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

#### FE-015 – Interactive Writing Coach with Tavus Conversations
- ✓ Real-time interactive conversations with genre-specific writing coaches
- ✓ Conversation API integration with Tavus
- ✓ Transcript generation and storage
- ✓ Transcript viewer UI for reviewing advice
- ✓ Genre-specific coaching based on project genre
- ✓ Database schema for conversation transcripts
- ✓ Webhook integration for transcript processing
- ✓ Tabbed interface for conversation and transcript

### Implementation Notes

Recent Updates:
- Fixed character creation functionality by updating database schema to use `codename_or_alias` instead of `codename`
  - Issue: Character creation was failing with "table characters has no column named codename_or_alias" error
  - Solution: 
    1. Updated database schema in server-side db.ts to use `codename_or_alias` field
    2. Modified API routes to use server-side database connection for consistent schema
    3. Added database migration (v5) to drop and recreate the characters table with the correct schema
    4. Updated all frontend components to use the new field name
  - Test credentials: 
    - First name: TEST
    - Last name: USER
    - Email: test.user@gmail.com
    - Password: 123
- Fixed 404 error when navigating to workspace sections after interacting with the avatar
- Added "Back to Author's Workspace" buttons to all workspace section pages for improved navigation
- Updated API calls to use ApiClient with proper authentication headers
- Enhanced error handling for workspace API endpoints
- Improved user experience with consistent navigation across all workspace sections
- Fixed authentication issues with workspace API endpoints by using ApiClient
- Standardized API call patterns across components for better maintainability

- Enhanced transcript UI with disabled button and status messages when transcript is not ready
- Added automatic transcript status checking with 30-second polling
- Improved user experience with tooltips explaining transcript generation process
- Added clear visual indicators for transcript generation status
- Implemented proper handling of transcript availability in the writing coach UI
- Fixed transcript viewing functionality for Tavus conversations
- Added conversation_transcripts table to database initialization
- Enhanced transcript endpoint to handle status-only data
- Improved TranscriptViewer UI with better status messages
- Added database migration for firstName and lastName columns in users table
- Fixed user registration issue with database schema
- Enhanced user profile support with first and last name fields
- Fixed database initialization issue with Tavus video status tracking
- Added tavus_videos table to server-side database schema
- Updated API routes to use server-side database functions
- Implemented better error handling during video status polling
- Added webhook endpoint for Tavus to notify when videos are ready
- Added video status endpoint for frontend polling
- Enhanced avatar display with clear processing state UI
- Successfully integrated with Tavus API - video creation now working!
- Fixed Tavus integration by updating to the correct API endpoint (tavusapi.com)
- Updated URL formats to use the correct domains (tavus.video for videos, tavus.daily.co for conversations)
- Removed persona_id parameter which was causing API errors
- Extended timeout to 30 seconds to accommodate slower API responses
- Added retry logic with exponential backoff for Tavus API calls
- Implemented improved loading UI with progress indicators
- Added camera/microphone permission notifications for users
- Enhanced error handling with detailed user feedback
- Updated video and conversation API endpoints to use the correct Tavus API endpoints
- Added robust error handling and fallback mechanisms for Tavus API failures
- Enhanced error reporting and user feedback for connection issues
- Implemented mock Tavus player for development and fallback scenarios
- Added environment variable to control mock player behavior
- Created utility functions for Tavus service availability detection
- Fixed DNS resolution issue with Tavus player by adding fallback content
- Added graceful error handling for Tavus iframe loading failures
- Implemented interactive writing coach with Tavus Conversations API
- Added conversation transcript generation and storage
- Created transcript viewer UI for reviewing coaching advice
- Enhanced Tavus integration with real-time interactive conversations
- Added database schema and API for conversation transcripts
- Implemented webhook for transcript processing
- Added direct API check endpoint to verify video status with Tavus servers
- Implemented "Force Check" functionality for videos that time out during processing
- Enhanced avatar display component with better timeout handling and user feedback
- Created a global polling registry to manage and track all polling requests
- Added rate limiting to prevent excessive API calls
- Implemented server-side blocking of problematic video IDs
- Added comprehensive debugging middleware for Tavus API requests
- Enhanced error handling with specific error messages for different failure scenarios
- Improved the UI to show a special state when videos time out with option to force check
- Fixed issue where videos might be ready on Tavus servers but not detected by our system
- Reduced maximum polling duration with option to manually check status afterward
- Added detailed logging throughout the video processing workflow
- Fixed timeout mechanism using absolute timestamps instead of counters
- Improved cleanup of stale polling intervals
- Fixed URL handling to use the most appropriate URL from Tavus API (stream_url, download_url, or hosted_url)
- Added generation progress tracking for better user feedback
- Fixed error in check endpoint by using mutable variables instead of trying to modify read-only objects
- Enhanced force check functionality to show more specific status messages
- Added success toast when video is ready after force check
- Fixed Tavus API integration by using the correct API endpoints:
  - Using persona_id for conversations API (/v2/conversations)
  - Using replica_id for videos API (/v2/videos)
- Updated onboarding flow to use the conversations API instead of the video API
- Implemented direct API check for videos that have been in queued/generating state for too long
- Fixed URL handling to use the most appropriate URL from Tavus API (stream_url, download_url, or hosted_url)
- Added generation progress tracking for better user feedback
- Fixed error in check endpoint by using mutable variables instead of trying to modify read-only objects
- Enhanced force check functionality to show more specific status messages
- Added success toast when video is ready after force check
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
