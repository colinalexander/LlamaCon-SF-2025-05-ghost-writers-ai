import { NextResponse } from 'next/server';
import {
  getCharacterById,
  updateCharacter,
  deleteCharacter
} from '@/lib/characters-data';
import { CharacterInput } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const character = await getCharacterById(params.id);

    if (!character) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(character);
  } catch (error) {
    console.error('Error fetching character:', error);
    return NextResponse.json(
      { error: 'Failed to fetch character' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { projectId, ...characterData } = (await request.json()) as {
      projectId: string;
    } & CharacterInput;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const success = await updateCharacter(params.id, projectId, characterData);

    if (!success) {
      return NextResponse.json(
        { error: 'Character not found or project ID mismatch' },
        { status: 404 }
      );
    }

    return NextResponse.json({ id: params.id });
  } catch (error) {
    console.error('Error updating character:', error);
    return NextResponse.json(
      { error: 'Failed to update character' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const url = new URL(request.url);
    const projectId = url.searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const success = await deleteCharacter(params.id, projectId);

    if (!success) {
      return NextResponse.json(
        { error: 'Character not found or project ID mismatch' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting character:', error);
    return NextResponse.json(
      { error: 'Failed to delete character' },
      { status: 500 }
    );
  }
}