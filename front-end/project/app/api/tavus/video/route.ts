import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Simulated video generation - in production, this would call the Tavus API
export async function POST(request: Request) {
  try {
    const { genre, personality, script } = await request.json();
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate a deterministic but unique video ID based on inputs
    const videoId = Buffer.from(`${genre}-${personality}-${Date.now()}`).toString('base64');
    
    return NextResponse.json({ videoId });
  } catch (error) {
    console.error('Error generating video:', error);
    return NextResponse.json(
      { error: 'Failed to generate video' },
      { status: 500 }
    );
  }
}