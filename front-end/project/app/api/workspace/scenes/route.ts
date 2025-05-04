import { dbRO, dbRW } from '@/lib/db';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Function to ensure the scenes table exists
async function ensureScenesTable() {
  try {
    // Check if the table exists by trying a simple query
    await dbRO.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='scenes'")
      .then(result => {
        if (result.rows.length === 0) {
          console.log('Scenes table does not exist. Creating it...');
          // Create the table
          return dbRW.execute(`
            CREATE TABLE IF NOT EXISTS scenes (
              id TEXT PRIMARY KEY,
              project_id TEXT NOT NULL,
              title TEXT NOT NULL,
              location TEXT NOT NULL,
              time TEXT NOT NULL,
              conflict TEXT NOT NULL,
              characters_present TEXT NOT NULL,
              character_changes TEXT,
              important_actions TEXT NOT NULL,
              mood TEXT NOT NULL,
              summary TEXT NOT NULL,
              scene_order INTEGER NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
          `);
        }
        return null;
      });
    console.log('Scenes table verified.');
  } catch (error) {
    console.error('Error ensuring scenes table:', error);
    throw error;
  }
}

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Ensure the scenes table exists
    await ensureScenesTable();
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
    // Ensure the scenes table exists
    await ensureScenesTable();
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
    
    // Handle potential null/undefined value with proper type handling
    const maxOrder = orderResult.rows[0]?.max_order;
    const nextOrder = typeof maxOrder === 'number' ? maxOrder + 1 : 1;

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
    // More detailed logging for debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'Failed to create scene: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}