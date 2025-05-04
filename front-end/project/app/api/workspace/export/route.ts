import { dbRO } from '@/lib/db';
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

    // Fetch project data
    const projectResult = await dbRO.execute({
      sql: 'SELECT * FROM projects WHERE id = ?',
      args: [projectId]
    });

    if (projectResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Fetch characters
    const charactersResult = await dbRO.execute({
      sql: 'SELECT * FROM characters WHERE project_id = ?',
      args: [projectId]
    });

    // Fetch recent scenes with memory
    const scenesResult = await dbRO.execute({
      sql: `SELECT s.*, 
            (SELECT json_group_array(json_object('category', category, 'text', text))
             FROM scene_memory sm 
             WHERE sm.scene_id = s.id) as memory
            FROM scenes s 
            WHERE project_id = ? 
            ORDER BY scene_order DESC LIMIT 5`,
      args: [projectId]
    });

    // Fetch memory by category
    const memoryResult = await dbRO.execute({
      sql: `SELECT category, json_group_array(text) as items
            FROM scene_memory
            WHERE project_id = ?
            GROUP BY category`,
      args: [projectId]
    });

    // Transform memory results into categorized structure
    const memory = memoryResult.rows.reduce((acc: any, row: any) => {
      acc[row.category.toLowerCase()] = JSON.parse(row.items);
      return acc;
    }, {
      characters: [],
      world: [],
      plot: [],
      style: []
    });

    const exportData = {
      project: projectResult.rows[0],
      characters: charactersResult.rows,
      scenes: scenesResult.rows.map((scene: any) => ({
        ...scene,
        memory: scene.memory ? JSON.parse(scene.memory) : []
      })),
      memory
    };

    return NextResponse.json(exportData);
  } catch (error) {
    console.error('Error generating export:', error);
    return NextResponse.json(
      { error: 'Failed to generate export' },
      { status: 500 }
    );
  }
}