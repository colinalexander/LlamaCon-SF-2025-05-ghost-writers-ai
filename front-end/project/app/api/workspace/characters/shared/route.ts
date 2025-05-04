import { dbRO } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await dbRO.execute({
      sql: 'SELECT * FROM shared_characters ORDER BY created_at DESC',
    });

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching shared characters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shared characters' },
      { status: 500 }
    );
  }
}