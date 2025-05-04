import { dbRW } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { scenes, projectId } = await request.json();

    // Update each scene's order in a transaction
    await dbRW.transaction(async (tx) => {
      for (const { id, scene_order } of scenes) {
        await tx.execute({
          sql: `UPDATE scenes 
                SET scene_order = ?, 
                    updated_at = CURRENT_TIMESTAMP 
                WHERE id = ? AND project_id = ?`,
          args: [scene_order, id, projectId]
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering scenes:', error);
    return NextResponse.json(
      { error: 'Failed to reorder scenes' },
      { status: 500 }
    );
  }
}