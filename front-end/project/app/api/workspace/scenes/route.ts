import { NextResponse } from 'next/server';
import { getScenes, createScene } from '@/lib/scenes-data';
import { SceneInput } from '@/lib/types';

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

    const scenes = await getScenes(projectId);
    return NextResponse.json(scenes);
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
    const data = await request.json();
    const { projectId, ...sceneData } = data as { projectId: string } & SceneInput;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const newSceneId = await createScene(projectId, sceneData);
    return NextResponse.json({ id: newSceneId });
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