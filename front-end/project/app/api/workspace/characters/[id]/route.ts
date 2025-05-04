import { dbRO, dbRW } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await dbRO.execute({
      sql: 'SELECT * FROM characters WHERE id = ?',
      args: [params.id]
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching character:', error);
    return NextResponse.json(
      { error: 'Failed to fetch character' },
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
    const { projectId, ...character } = data;

    const result = await dbRW.execute({
      sql: `UPDATE characters SET
        name = ?,
        codename = ?,
        role = ?,
        background = ?,
        personality_traits = ?,
        skills = ?,
        wants = ?,
        fears = ?,
        appearance = ?,
        status = ?,
        notes = ?,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND project_id = ?
        RETURNING id`,
      args: [
        character.name,
        character.codename || null,
        character.role,
        character.background,
        character.personalityTraits,
        character.skills,
        character.wants,
        character.fears,
        character.appearance,
        character.status,
        character.notes || null,
        params.id,
        projectId
      ]
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ id: result.rows[0].id });
  } catch (error) {
    console.error('Error updating character:', error);
    return NextResponse.json(
      { error: 'Failed to update character' },
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
      sql: 'DELETE FROM characters WHERE id = ? AND project_id = ? RETURNING id',
      args: [params.id, projectId]
    });

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting character:', error);
    return NextResponse.json(
      { error: 'Failed to delete character' },
      { status: 500 }
    );
  }
}