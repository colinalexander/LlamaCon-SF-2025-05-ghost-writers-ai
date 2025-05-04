import { NextResponse } from 'next/server';
import { dbRO, initializeDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const { conversationId } = params;
    
    // Initialize database to ensure tables exist
    await initializeDatabase();
    
    // Retrieve the transcript from your database
    const result = await dbRO.execute({
      sql: `
        SELECT transcript, created_at
        FROM conversation_transcripts
        WHERE conversation_id = ?
        ORDER BY created_at DESC
        LIMIT 1
      `,
      args: [conversationId]
    });
    
    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Transcript not found' },
        { status: 404 }
      );
    }
    
    // Handle potential null transcript
    const transcriptData = result.rows[0].transcript;
    if (!transcriptData) {
      return NextResponse.json(
        { error: 'Transcript data is empty' },
        { status: 404 }
      );
    }
    
    try {
      // Parse the transcript data
      const parsedData = JSON.parse(transcriptData as string);
      
      // Check if this is just status information or a full transcript
      if (parsedData.status && !parsedData.messages) {
        // Create a mock transcript with the status information
        const mockTranscript = {
          status: parsedData.status,
          url: parsedData.url,
          messages: [
            {
              role: 'system',
              content: 'Conversation has been created but no transcript is available yet.',
              timestamp: result.rows[0].created_at
            }
          ]
        };
        
        return NextResponse.json({ 
          transcript: mockTranscript,
          isComplete: false,
          statusOnly: true
        });
      }
      
      // Return the full transcript
      return NextResponse.json({ 
        transcript: parsedData,
        isComplete: true,
        statusOnly: false
      });
    } catch (parseError) {
      console.error('Error parsing transcript data:', parseError);
      return NextResponse.json(
        { error: 'Invalid transcript data format' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error retrieving transcript:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve transcript' },
      { status: 500 }
    );
  }
}
