import { NextResponse } from 'next/server';
import { getTavusVideoStatus, updateTavusVideoStatus } from '@/server/lib/db';
import { fetchWithRetry } from '@/lib/tavus-utils';

export const dynamic = 'force-dynamic';

// Simple rate limiting implementation
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests per minute (1 per second on average)

// Store request counts by IP and video ID
const requestCounts: Record<string, { count: number, resetTime: number }> = {};

// Function to check if a request is rate limited
function isRateLimited(videoId: string, ip: string): boolean {
  const key = `${ip}:${videoId}`;
  const now = Date.now();
  
  // Initialize or reset if window has expired
  if (!requestCounts[key] || now > requestCounts[key].resetTime) {
    requestCounts[key] = {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    };
    return false;
  }
  
  // Increment count and check if over limit
  requestCounts[key].count++;
  
  if (requestCounts[key].count > MAX_REQUESTS_PER_WINDOW) {
    console.log(`Rate limit exceeded for video ID ${videoId} from IP ${ip}`);
    return true;
  }
  
  return false;
}

/**
 * Endpoint to check the status of a Tavus video
 * 
 * This endpoint is used by the frontend to poll for updates on a video's status.
 * It returns the current status of the video from the database.
 */
// List of known problematic video IDs to block
const BLOCKED_VIDEO_IDS = [
  'rf4703150052-1746344163874'
];

export async function GET(
  request: Request,
  { params }: { params: { videoId: string } }
) {
  try {
    const videoId = params.videoId;
    
    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }
    
    // Get client IP address (or use a fallback)
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown-ip';
    
    // Check rate limiting
    if (isRateLimited(videoId, ip.toString())) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please slow down your requests.' },
        { status: 429 } // 429 Too Many Requests
      );
    }
    
    // Block requests for known problematic video IDs
    if (BLOCKED_VIDEO_IDS.includes(videoId)) {
      console.log(`Blocking request for known problematic video ID: ${videoId}`);
      return NextResponse.json(
        { error: 'This video ID is blocked due to known issues', videoId },
        { status: 410 } // 410 Gone - indicates the resource is no longer available
      );
    }
    
    // Get the video status from the database
    let videoData;
    try {
      videoData = await getTavusVideoStatus(videoId);
      
      if (!videoData) {
        console.log(`Video not found in database: ${videoId}`);
        return NextResponse.json(
          { error: 'Video not found', videoId },
          { status: 404 }
        );
      }
      
      // If the video is in 'queued' or 'generating' state for more than 30 seconds,
      // try to check directly with the Tavus API
      const now = new Date();
      const updatedAt = new Date(videoData.updated_at);
      const timeDiff = now.getTime() - updatedAt.getTime();
      const secondsDiff = Math.floor(timeDiff / 1000);
      
      if ((videoData.status === 'queued' || videoData.status === 'generating') && secondsDiff > 30) {
        console.log(`Video ${videoId} has been in ${videoData.status} state for ${secondsDiff} seconds, checking with Tavus API directly`);
        
        try {
          const tavusResponse = await fetchWithRetry(
            `https://tavusapi.com/v2/videos/${videoId}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.TAVUS_API_KEY || '',
              },
            },
            2,  // 2 retries
            10000  // 10-second timeout
          );
          
          if (tavusResponse.ok) {
            const tavusData = await tavusResponse.json();
            console.log(`Tavus API response for video ${videoId}:`, tavusData);
            
            // If the status has changed, update our database
            if (tavusData.status && tavusData.status !== videoData.status) {
              console.log(`Updating video status in database: ${videoId} from ${videoData.status} to ${tavusData.status}`);
              await updateTavusVideoStatus(videoId, tavusData.status);
              videoData.status = tavusData.status;
              videoData.updated_at = new Date().toISOString();
            }
            
            // Determine the best URL to use
            let bestVideoUrl = videoData.hosted_url;
            
            // If the Tavus API response has a stream_url, use that instead
            if (tavusData.stream_url) {
              console.log(`Using stream_url for video ${videoId}: ${tavusData.stream_url}`);
              bestVideoUrl = tavusData.stream_url;
            } 
            // Otherwise, if it has a download_url, use that as a fallback
            else if (tavusData.download_url) {
              console.log(`Using download_url for video ${videoId}: ${tavusData.download_url}`);
              bestVideoUrl = tavusData.download_url;
            }
            // Otherwise, use the hosted_url from the Tavus API response if available
            else if (tavusData.hosted_url) {
              console.log(`Using hosted_url from Tavus API for video ${videoId}: ${tavusData.hosted_url}`);
              bestVideoUrl = tavusData.hosted_url;
            }
            
            // Return the updated data with the best URL
            return NextResponse.json({
              videoId: videoData.video_id,
              status: videoData.status,
              hostedUrl: bestVideoUrl,
              createdAt: videoData.created_at,
              updatedAt: videoData.updated_at,
              generation_progress: tavusData.generation_progress || '0/100'
            });
          }
        } catch (tavusError) {
          console.error(`Error checking with Tavus API for video ${videoId}:`, tavusError);
          // Continue with the database status if the Tavus API check fails
        }
      }
    } catch (dbError) {
      console.error('Database error when fetching video status:', dbError);
      return NextResponse.json(
        { error: 'Database error when fetching video status', details: String(dbError) },
        { status: 500 }
      );
    }
    
    // If we got here, we have valid video data
    return NextResponse.json({
      videoId: videoData.video_id,
      status: videoData.status,
      hostedUrl: videoData.hosted_url,
      createdAt: videoData.created_at,
      updatedAt: videoData.updated_at
    });
  } catch (error) {
    console.error('Error fetching video status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video status' },
      { status: 500 }
    );
  }
}
