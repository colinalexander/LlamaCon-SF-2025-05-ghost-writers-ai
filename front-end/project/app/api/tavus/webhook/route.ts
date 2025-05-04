import { NextResponse } from 'next/server';
import { updateTavusVideoStatus, getTavusVideoStatus } from '@/server/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Webhook endpoint for Tavus to call when a video is ready
 * 
 * This endpoint receives notifications from Tavus when a video's status changes
 * and updates the database accordingly.
 * 
 * Expected payload:
 * {
 *   video_id: string;
 *   status: string; // "ready", "failed", etc.
 *   hosted_url: string;
 * }
 */
export async function POST(request: Request) {
  try {
    // Verify the request is from Tavus (in production, add proper authentication)
    // For now, we'll just check if the request has the expected fields
    
    const payload = await request.json();
    
    if (!payload.video_id || !payload.status) {
      return NextResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
      );
    }
    
    console.log('Received Tavus webhook:', payload);
    
    // Check if the video exists in our database
    const existingVideo = await getTavusVideoStatus(payload.video_id);
    
    if (!existingVideo) {
      console.error('Video not found in database:', payload.video_id);
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }
    
    // Update the video status
    await updateTavusVideoStatus(payload.video_id, payload.status);
    
    console.log(`Updated video ${payload.video_id} status to ${payload.status}`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing Tavus webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
