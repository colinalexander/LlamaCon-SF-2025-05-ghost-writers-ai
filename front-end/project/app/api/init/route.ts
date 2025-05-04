import { dbRW } from '@/lib/db';
import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const schema = readFileSync(join(process.cwd(), 'db', 'schema.sql'), 'utf8');
    await dbRW.execute(schema);
    return NextResponse.json({ message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return NextResponse.json({ error: 'Failed to initialize database' }, { status: 500 });
  }
}