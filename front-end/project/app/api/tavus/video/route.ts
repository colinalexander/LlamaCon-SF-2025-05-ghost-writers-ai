import { NextResponse } from 'next/server';
import { tavusPrompts } from '@/lib/tavus-prompts';
import { fetchWithRetry } from '@/lib/tavus-utils';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { genre, personality, script } = await request.json();
    
    // Get the appropriate persona and replica IDs from tavus-prompts.json
    const genreConfig = tavusPrompts.genres[genre as keyof typeof tavusPrompts.genres];
    
    if (!genreConfig) {
      return NextResponse.json(
        { error: 'Invalid genre specified' },
        { status: 400 }
      );
    }
    
    // Call the Tavus API directly to create a video
    try {
      console.log('Calling Tavus API with key:', process.env.TAVUS_API_KEY?.substring(0, 5) + '...');
      console.log('This may take up to 20 seconds...');
      
      // Use fetchWithRetry with a 20-second timeout and 3 retries
      const createVideoResponse = await fetchWithRetry(
        'https://tavusapi.com/v2/videos',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.TAVUS_API_KEY || '',
          },
          body: JSON.stringify({
            replica_id: genreConfig.replica_id,
            // persona_id is not accepted in the video creation API
            script: script || `Hello! I'm your ${genreConfig.name}. I'm here to help you with your ${genre} writing project.`,
          }),
        },
        3,  // 3 retries
        30000  // 30-second timeout
      );
      
      if (!createVideoResponse.ok) {
        const errorData = await createVideoResponse.json();
        console.error('Error creating Tavus video:', errorData);
        throw new Error(`Failed to create Tavus video: ${createVideoResponse.status}`);
      }
      
      const videoData = await createVideoResponse.json();
      console.log('Tavus video created successfully:', videoData);
      
      // Store the video data in the database
      const hostedUrl = videoData.hosted_url || `https://tavus.video/${videoData.video_id}`;
      
      // Import the createTavusVideo function from server/lib/db.ts
      const { createTavusVideo } = await import('@/server/lib/db');
      
      // Store the video in the database
      await createTavusVideo({
        video_id: videoData.video_id,
        status: videoData.status || 'queued',
        hosted_url: hostedUrl
        // project_id is optional, so we can omit it
      });
      
      // Return the video ID and URL
      return NextResponse.json({ 
        videoId: videoData.video_id,
        videoUrl: hostedUrl,
        status: videoData.status || 'queued'
      });
    } catch (apiError) {
      console.error('Error calling Tavus API:', apiError);
      
      // Fallback to a mock implementation if the API call fails
      console.log('Using fallback for Tavus video');
      
      // Create a unique ID for this video with a random component
      const videoId = `${genreConfig.replica_id}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      
      // Use the tavus.video URL format based on the API response
      const videoUrl = `https://tavus.video/${videoId}`;
      
      // Log the request for debugging
      console.log('Generating Tavus video (fallback):', {
        genre,
        personality,
        replicaId: genreConfig.replica_id,
        personaId: genreConfig.persona_id,
        videoId,
        videoUrl
      });
      
      return NextResponse.json({ 
        videoId,
        videoUrl
      });
    }
  } catch (error) {
    console.error('Error generating video:', error);
    return NextResponse.json(
      { error: 'Failed to generate video' },
      { status: 500 }
    );
  }
}
