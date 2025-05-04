import { dbRO, dbRW } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
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

    const result = await dbRO.execute({
      sql: `SELECT * FROM scene_history 
            WHERE scene_id = ? AND project_id = ? 
            ORDER BY created_at DESC`,
      args: [params.id, projectId]
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
    const { projectId, content } = data;

    if (!projectId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await dbRW.execute({
      sql: `INSERT INTO scene_history (
              id,
              scene_id,
              project_id,
              content,
              created_at
            ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
            RETURNING id`,
      args: [
        crypto.randomUUID(),
        params.id,
        projectId,
        content
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