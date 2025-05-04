import { dbRO } from '@/lib/db';
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
      sql: `SELECT * FROM scene_memory 
            WHERE scene_id = ? AND project_id = ? 
            ORDER BY created_at DESC`,
      args: [params.id, projectId]
    });

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching scene memory:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scene memory' },
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
    const { projectId, text, category } = data;

    if (!projectId || !text || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await dbRO.execute({
      sql: `INSERT INTO scene_memory (
              id,
              scene_id,
              project_id,
              text,
              category,
              created_at,
              updated_at
            ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING id`,
      args: [
        crypto.randomUUID(),
        params.id,
        projectId,
        text,
        category
      ]
    });

    return NextResponse.json({ id: result.rows[0].id });
  } catch (error) {
    console.error('Error creating scene memory:', error);
    return NextResponse.json(
      { error: 'Failed to create scene memory' },
      { status: 500 }
    );
  }
}