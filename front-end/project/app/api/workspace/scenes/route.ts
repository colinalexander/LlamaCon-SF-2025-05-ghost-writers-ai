import { dbRO, dbRW } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const result = await dbRO.execute({
      sql: 'SELECT * FROM scenes WHERE project_id = ? ORDER BY scene_order ASC',
      args: [projectId]
    });

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching scenes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scenes' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { projectId, ...scene } = data;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Get the highest scene_order for the project
    const orderResult = await dbRO.execute({
      sql: 'SELECT COALESCE(MAX(scene_order), 0) as max_order FROM scenes WHERE project_id = ?',
      args: [projectId]
    });
    const nextOrder = orderResult.rows[0].max_order + 1;

    const result = await dbRW.execute({
      sql: `INSERT INTO scenes (
        id,
        project_id,
        title,
        location,
        time,
        conflict,
        characters_present,
        character_changes,
        important_actions,
        mood,
        summary,
        scene_order,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id`,
      args: [
        crypto.randomUUID(),
        projectId,
        scene.title,
        scene.location,
        scene.time,
        scene.conflict,
        scene.charactersPresent,
        scene.characterChanges,
        scene.importantActions,
        scene.mood,
        scene.summary,
        nextOrder
      ]
    });

    return NextResponse.json({ id: result.rows[0].id });
  } catch (error) {
    console.error('Error creating scene:', error);
    return NextResponse.json(
      { error: 'Failed to create scene' },
      { status: 500 }
    );
  }
}