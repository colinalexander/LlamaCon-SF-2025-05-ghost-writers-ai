import { NextResponse } from 'next/server';
import { fetchWithRetry } from '@/lib/tavus-utils';
import { updateTavusVideoStatus, getTavusVideoStatus } from '@/server/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Endpoint to directly check the status of a Tavus video with the Tavus API
 * 
 * This endpoint is used when we need to bypass our database and check directly
 * with the Tavus API for the most up-to-date status of a video.
 */
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
    
    console.log(`Directly checking Tavus API for video status: ${videoId}`);
    
    // First, get the current status from our database
    let dbVideoData = await getTavusVideoStatus(videoId);
    
    if (!dbVideoData) {
      console.log(`Video not found in database: ${videoId}`);
      return NextResponse.json(
        { error: 'Video not found in database', videoId },
        { status: 404 }
      );
    }
    
    // Now check directly with the Tavus API
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
      
      if (!tavusResponse.ok) {
        // If the Tavus API returns an error, log it but still return our database status
        console.error(`Tavus API error for video ${videoId}:`, tavusResponse.status);
        return NextResponse.json({
          videoId: dbVideoData.video_id,
          status: dbVideoData.status,
          hostedUrl: dbVideoData.hosted_url,
          createdAt: dbVideoData.created_at,
          updatedAt: dbVideoData.updated_at,
          directCheckFailed: true
        });
      }
      
      // Parse the Tavus API response
      const tavusData = await tavusResponse.json();
      console.log(`Tavus API response for video ${videoId}:`, tavusData);
      
      // If the status has changed, update our database
      if (tavusData.status && tavusData.status !== dbVideoData.status) {
        console.log(`Updating video status in database: ${videoId} from ${dbVideoData.status} to ${tavusData.status}`);
        await updateTavusVideoStatus(videoId, tavusData.status);
        
        // Create a new response object with the updated status instead of modifying the original
        const updatedVideoData = {
          ...dbVideoData,
          status: tavusData.status,
          updated_at: new Date().toISOString()
        };
        
        // Use the updated object for our response
        dbVideoData = updatedVideoData;
      }
      
      // Determine the best URL to use
      let bestVideoUrl = dbVideoData.hosted_url;
      
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
      
      // Return the updated data with the best URL and generation progress if available
      return NextResponse.json({
        videoId: dbVideoData.video_id,
        status: dbVideoData.status,
        hostedUrl: bestVideoUrl, // Use the best URL we determined
        createdAt: dbVideoData.created_at,
        updatedAt: dbVideoData.updated_at,
        generation_progress: tavusData.generation_progress || '0/100', // Include generation progress
        directCheckSuccess: true
      });
    } catch (tavusError) {
      console.error(`Error checking with Tavus API for video ${videoId}:`, tavusError);
      
      // If we can't reach the Tavus API, return our database status
      return NextResponse.json({
        videoId: dbVideoData.video_id,
        status: dbVideoData.status,
        hostedUrl: dbVideoData.hosted_url,
        createdAt: dbVideoData.created_at,
        updatedAt: dbVideoData.updated_at,
        directCheckFailed: true
      });
    }
  } catch (error) {
    console.error('Error checking video status:', error);
    return NextResponse.json(
      { error: 'Failed to check video status' },
      { status: 500 }
    );
  }
}
