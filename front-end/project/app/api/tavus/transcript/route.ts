import { NextResponse } from 'next/server';
import { dbRW, initializeDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Parse the webhook payload
    const data = await request.json();
    
    // Verify this is a transcript event
    if (data.event !== 'application.transcription_ready') {
      return NextResponse.json({ status: 'ignored' });
    }
    
    // Extract the conversation ID and transcript
    const { conversation_id, transcript } = data;
    
    // Initialize database to ensure tables exist
    await initializeDatabase();
    
    // Store the transcript in your database
    await dbRW.execute({
      sql: `
        INSERT INTO conversation_transcripts (conversation_id, transcript, created_at)
        VALUES (?, ?, ?)
      `,
      args: [conversation_id, JSON.stringify(transcript), new Date().toISOString()]
    });
    
    // You could also trigger any post-processing here
    // For example, summarizing the transcript or extracting key points
    
    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Error processing transcript webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process transcript' },
      { status: 500 }
    );
  }
}
