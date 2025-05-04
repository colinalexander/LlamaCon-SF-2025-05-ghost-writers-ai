import { dbRO, dbRW, verifySceneExists } from '@/lib/db';
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

    // Get scene history based on the actual schema (which doesn't have a content column)
    const historyResult = await dbRO.execute({
      sql: `SELECT id, scene_id, change_type, change_description, changed_at as timestamp, changed_by
            FROM scene_history 
            WHERE scene_id = ? 
            ORDER BY changed_at DESC`,
      args: [params.id]
    });
    
    // Get the current scene content to include with the history results
    const contentResult = await dbRO.execute({
      sql: `SELECT content FROM scenes WHERE id = ?`,
      args: [params.id]
    });
    
    // Extract content, default to null if not found
    const currentContentValue = contentResult.rows.length > 0 ? contentResult.rows[0].content : null;

    // Return both history and current content
    return NextResponse.json({
      history: historyResult.rows,
      currentContent: currentContentValue
    });
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
    const { content, projectId } = data;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

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

    // Save the current content to the scenes table
    await dbRW.execute({
      sql: `UPDATE scenes SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      args: [content, params.id]
    });

    // Add to history table with the fields it actually has
    const result = await dbRW.execute({
      sql: `INSERT INTO scene_history (
              scene_id,
              change_type,
              change_description
            ) VALUES (?, ?, ?)
            RETURNING id, changed_at as timestamp`,
      args: [
        params.id,
        'content_update',
        'Scene content updated'
      ]
    });

    return NextResponse.json({ 
      id: result.rows[0].id,
      timestamp: result.rows[0].timestamp,
      content: content // Return the content we just saved
    });
  } catch (error) {
    console.error('Error saving scene content history:', error);
    return NextResponse.json(
      { error: 'Failed to save scene content' },
      { status: 500 }
    );
  }
}