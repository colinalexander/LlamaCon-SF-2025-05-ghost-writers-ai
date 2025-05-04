import { dbRO, dbRW, initializeDatabase } from '@/server/lib/db';
import { NextResponse } from 'next/server';
import { getCharacters, createCharacter } from '@/lib/characters-data';
import { CharacterInput } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Initialize database to ensure tables exist
    await initializeDatabase();
    
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const characters = await getCharacters(projectId);
    return NextResponse.json(characters);
  } catch (error) {
    console.error('Error fetching characters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch characters' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Initialize database to ensure tables exist
    await initializeDatabase();
    
    const data = await request.json();
    const { projectId, ...characterData } = data as { projectId: string } & CharacterInput;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Construct args array, ensuring undefined values become null
    const args = [
      crypto.randomUUID(),
      projectId,
      characterData.name,
      characterData.codename || null,
      characterData.role,
      characterData.background,
      characterData.personality_traits || null,
      characterData.skills,
      characterData.wants,
      characterData.fears,
      characterData.appearance,
      characterData.status,
      characterData.notes || null
    ];

    const result = await dbRW.execute({
      sql: `INSERT INTO characters (
        id,
        project_id,
        name,
        codename_or_alias,
        role,
        background,
        personality_traits,
        skills,
        wants,
        fears,
        appearance,
        status,
        notes,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id`,
      args: args
    });

    return NextResponse.json({ id: result.rows[0].id });

  } catch (error) {
    console.error('Error creating character:', error);
    return NextResponse.json(
      { error: 'Failed to create character' },
      { status: 500 }
    );
  }
}
