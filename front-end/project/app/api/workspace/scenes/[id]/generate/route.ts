import { NextResponse } from 'next/server';
import { dbRO } from '@/lib/db';

export const dynamic = 'force-dynamic';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

interface GenerationRequest {
  wordTarget: number;
  projectId: string;
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data: GenerationRequest = await request.json();
    const { wordTarget, projectId } = data;

    // Fetch scene details
    const sceneResult = await dbRO.execute({
      sql: 'SELECT * FROM scenes WHERE id = ? AND project_id = ?',
      args: [params.id, projectId]
    });

    if (sceneResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Scene not found' },
        { status: 404 }
      );
    }

    const scene = sceneResult.rows[0];

    // Fetch characters mentioned in the scene
    const characterIds = scene.characters_present.split(',').map((id: string) => id.trim());
    const charactersResult = await dbRO.execute({
      sql: 'SELECT * FROM characters WHERE id IN (?) AND project_id = ?',
      args: [characterIds, projectId]
    });

    // Call FastAPI service
    const response = await fetch(`${AI_SERVICE_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scene,
        characters: charactersResult.rows,
        wordTarget,
      }),
    });

    if (!response.ok) {
      throw new Error('AI service failed to generate scene');
    }

    const { text } = await response.json();
    return NextResponse.json({ text });
  } catch (error) {
    console.error('Error generating scene:', error);
    return NextResponse.json(
      { error: 'Failed to generate scene' },
      { status: 500 }
    );
  }
}