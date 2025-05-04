import { dbRO, verifySceneExists } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the project ID from the query params
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Verify the scene exists and belongs to the project
    const scene = await verifySceneExists(params.id, projectId);
    if (!scene) {
      return NextResponse.json(
        { error: 'Scene not found or does not belong to this project' },
        { status: 404 }
      );
    }

    const sceneData = scene;

    let characterIds: string[] = [];
    if (sceneData.characters_present && typeof sceneData.characters_present === 'string') {
      characterIds = sceneData.characters_present.split(',').map((c: string) => c.trim());
    }
    
    // Get characters for this scene
    let characters;
    if (characterIds.length > 0) {
      // Only query by IDs if we have characters
      const placeholders = characterIds.map(() => '?').join(',');
      characters = await dbRO.execute({
        sql: `SELECT * FROM characters 
              WHERE project_id = ? 
              AND id IN (${placeholders})`,
        args: [
          projectId,
          ...characterIds
        ]
      });
    } else {
      // Just get all project characters if no specific ones are requested
      characters = await dbRO.execute({
        sql: `SELECT * FROM characters WHERE project_id = ?`,
        args: [projectId]
      });
    }

    // Get memory entries for this scene
    const memory = await dbRO.execute({
      sql: `SELECT * FROM scene_memory 
            WHERE scene_id = ? AND project_id = ? 
            ORDER BY created_at DESC`,
      args: [params.id, projectId]
    });

    return NextResponse.json({
      scene: {
        title: sceneData.title,
        location: sceneData.location,
        time: sceneData.time,
        conflict: sceneData.conflict,
        mood: sceneData.mood,
        characters_present: sceneData.characters_present
      },
      characters: characters.rows,
      memory: memory.rows
    });
  } catch (error) {
    console.error('Error fetching scene context:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scene context' },
      { status: 500 }
    );
  }
}
