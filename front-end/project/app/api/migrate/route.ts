import { NextResponse } from 'next/server';
import { runMigration } from '@/lib/db-migrate';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await runMigration();
    return NextResponse.json({ success: true, message: 'Database migration completed successfully' });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to run database migration' },
      { status: 500 }
    );
  }
}
