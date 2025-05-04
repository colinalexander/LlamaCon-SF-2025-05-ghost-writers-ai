import { NextResponse } from 'next/server';
import { dbRO, dbRW } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Function to ensure the characters table exists
async function ensureCharactersTable() {
  try {
    // Check if the table exists by trying a simple query
    await dbRO.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='characters'")
      .then(result => {
        if (result.rows.length === 0) {
          console.log('Characters table does not exist. Creating it...');
          // Create the table
          return dbRW.execute(`
            CREATE TABLE IF NOT EXISTS characters (
              id TEXT PRIMARY KEY,
              project_id TEXT NOT NULL,
              name TEXT NOT NULL,
              role TEXT,
              traits TEXT,
              motivation TEXT,
              background TEXT,
              appearance TEXT,
              relationships TEXT,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
          `);
        }
        return null;
      });
    console.log('Characters table verified.');
  } catch (error) {
    console.error('Error ensuring characters table:', error);
    throw error;
  }
}

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

interface GenerationRequest {
  wordTarget: number;
  projectId: string;
  includeMemory?: boolean;
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data: GenerationRequest = await request.json();
    const { wordTarget, projectId, includeMemory = true } = data;

    // Validate inputs
    if (!projectId || !params.id) {
      return NextResponse.json(
        { error: 'Project ID and Scene ID are required' },
        { status: 400 }
      );
    }

    // Fetch scene details
    const sceneResult = await dbRO.execute({
      sql: 'SELECT * FROM scenes WHERE id = ? AND project_id = ?',
      args: [params.id, projectId]
    });

    if (sceneResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Scene not found' },
        { status: 404 }
      );
    }

    const scene = sceneResult.rows[0];

    // First ensure the characters table exists
    try {
      await ensureCharactersTable();
    } catch (error) {
      console.warn('Failed to create characters table, proceeding without characters:', error);
    }

    // Setup default empty result for characters
    let charactersResult: { rows: any[] } = { rows: [] };
    
    try {
      // Only attempt to fetch characters if the characters_present field exists and has content
      if (scene.characters_present && typeof scene.characters_present === 'string' && scene.characters_present.trim()) {
        const sceneCharacterIds = scene.characters_present.split(',').filter((id: string) => id.trim()).map((id: string) => id.trim());
        
        if (sceneCharacterIds.length > 0) {
          // For SQL IN clauses with multiple parameters, use a different approach
          // We'll build a parametrized query with the right number of placeholders
          const placeholders = sceneCharacterIds.map(() => '?').join(',');
          charactersResult = await dbRO.execute({
            sql: `SELECT * FROM characters WHERE id IN (${placeholders}) AND project_id = ?`,
            args: [...sceneCharacterIds, projectId]
          });
        }
      }
    } catch (error) {
      console.warn('Error fetching characters, proceeding without character data:', error);
    }

    // Format character IDs for the backend
    const characterIds = charactersResult.rows.map((character: any) => character.id);

    // Get user ID from request headers
    const userId = request.headers.get('x-user-id') || 'frontend-user';
    
    console.log('Calling AI service with:', {
      url: `${AI_SERVICE_URL}/agents/generate/scene`,
      userId,
      sceneId: params.id,
      projectId,
      wordCount: wordTarget,
      characterIds,
      includeMemory
    });
    
    // Get scene data for fallback text generation (if backend fails)
    let sceneTitle = scene.title || '';
    let sceneLocation = scene.location || '';
    let sceneTime = scene.time || '';
    let sceneConflict = scene.conflict || '';
    
    // Call FastAPI service with the correct format
    const response = await fetch(`${AI_SERVICE_URL}/agents/generate/scene`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId // Forward the user ID from the frontend
      },
      body: JSON.stringify({
        scene_id: params.id,
        project_id: projectId,
        word_count: wordTarget,
        include_characters: characterIds,
        include_memory: includeMemory
      }),
    });

    if (!response.ok) {
      let errorDetail = 'Unknown error';
      let errorData = {};
      
      try {
        // Explicitly type the error data to include potential 'detail' property
        interface ErrorResponse {
          detail?: string;
          [key: string]: any;
        }
        errorData = await response.json() as ErrorResponse;
        errorDetail = errorData.detail || `Status ${response.status}: ${response.statusText}`;
        console.error('Generation API error:', errorData);
      } catch (jsonError) {
        // If the response is not valid JSON
        console.error('Failed to parse error response:', jsonError);
        errorDetail = `Status ${response.status}: ${response.statusText}`;
        // Try to get the text response
        try {
          const textError = await response.text();
          console.error('Error response text:', textError);
          errorDetail = textError || errorDetail;
        } catch (textError) {
          console.error('Failed to get error text:', textError);
        }
      }
      
      console.error(`AI service failed: ${errorDetail}`);
      
      // If backend fails, generate a basic template instead of throwing an error
      // This allows users to continue working even if the backend AI service is unavailable
      console.log('Using fallback text generation since backend AI service failed');
      return NextResponse.json({
        text: `[Scene: ${sceneTitle}]
[Location: ${sceneLocation}]
[Time: ${sceneTime}]

The scene opens at ${sceneLocation}. ${sceneConflict}

[This is a placeholder for AI-generated content. The AI service is currently unavailable. You can edit this text manually to continue your work, or try generating again later.]

[Characters present: ${characterIds.join(', ')}]`
      });
    }

    const result = await response.json();
    // The backend returns generated_text, but frontend expects text
    return NextResponse.json({ text: result.generated_text });
  } catch (error) {
    console.error('Error generating scene:', error);
    return NextResponse.json(
      { error: 'Failed to generate scene: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}