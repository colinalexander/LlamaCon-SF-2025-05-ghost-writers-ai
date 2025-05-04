import { dbRO, dbRW } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await dbRO.execute({
      sql: 'SELECT * FROM scenes WHERE id = ?',
      args: [params.id]
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Scene not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching scene:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scene' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const { projectId, ...scene } = data;

    const result = await dbRW.execute({
      sql: `UPDATE scenes SET
        title = ?,
        location = ?,
        time = ?,
        conflict = ?,
        characters_present = ?,
        character_changes = ?,
        important_actions = ?,
        mood = ?,
        summary = ?,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND project_id = ?
        RETURNING id`,
      args: [
        scene.title,
        scene.location,
        scene.time,
        scene.conflict,
        scene.charactersPresent,
        scene.characterChanges,
        scene.importantActions,
        scene.mood,
        scene.summary,
        params.id,
        projectId
      ]
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Scene not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ id: result.rows[0].id });
  } catch (error) {
    console.error('Error updating scene:', error);
    return NextResponse.json(
      { error: 'Failed to update scene' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const result = await dbRW.execute({
      sql: 'DELETE FROM scenes WHERE id = ? AND project_id = ? RETURNING id',
      args: [params.id, projectId]
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Scene not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting scene:', error);
    return NextResponse.json(
      { error: 'Failed to delete scene' },
      { status: 500 }
    );
  }
}