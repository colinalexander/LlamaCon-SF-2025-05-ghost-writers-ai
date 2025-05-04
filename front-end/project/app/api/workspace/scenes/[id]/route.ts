import { NextResponse } from 'next/server';
import { getSceneById, updateScene, deleteScene } from '@/lib/scenes-data';
import { SceneInput } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const scene = await getSceneById(params.id);

    if (!scene) {
      return NextResponse.json(
        { error: 'Scene not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(scene);
  } catch (error) {
    console.error('Error fetching scene:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scene' },
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

    // Ensure projectId is present and extract scene data correctly
    if (!data.projectId) {
      return NextResponse.json(
        { error: 'Project ID is required in the request body' },
        { status: 400 }
      );
    }
    const projectId = data.projectId as string;
    const sceneData = data as SceneInput; // Assuming the rest of the data matches SceneInput

    const updatedSceneId = await updateScene(params.id, projectId, sceneData);

    if (!updatedSceneId) {
      return NextResponse.json(
        { error: 'Scene not found or update failed' }, // Adjusted error message
        { status: 404 }
      );
    }

    return NextResponse.json({ id: updatedSceneId });
  } catch (error) {
    console.error('Error updating scene:', error);
    return NextResponse.json(
      { error: 'Failed to update scene' },
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
    const projectId = searchParams.get('projectId'); // projectId is required for deletion, get it from query params

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const deleted = await deleteScene(params.id, projectId);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Scene not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting scene:', error);
    return NextResponse.json(
      { error: 'Failed to delete scene' },
      { status: 500 }
    );
  }
}