import { dbRO, dbRW } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // We only need the scene_id since the table doesn't have a project_id column
    const result = await dbRO.execute({
      sql: `SELECT * FROM scene_history 
            WHERE scene_id = ? 
            ORDER BY changed_at DESC`,
      args: [params.id]
    });

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching scene history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scene history' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const { changeType, changeDescription, changedBy } = data;

    if (!changeType) {
      return NextResponse.json(
        { error: 'Change type is required' },
        { status: 400 }
      );
    }

    const result = await dbRW.execute({
      sql: `INSERT INTO scene_history (
              scene_id,
              change_type,
              change_description,
              changed_by
            ) VALUES (?, ?, ?, ?)
            RETURNING id`,
      args: [
        params.id,
        changeType,
        changeDescription || null,
        changedBy || null
      ]
    });

    return NextResponse.json({ id: result.rows[0].id });
  } catch (error) {
    console.error('Error creating scene history:', error);
    return NextResponse.json(
      { error: 'Failed to create scene history' },
      { status: 500 }
    );
  }
}