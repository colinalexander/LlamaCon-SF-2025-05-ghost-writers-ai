import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const generateScript = (genre: string) => {
  const scripts = {
    fantasy: "Welcome to your magical journey! I'm here to help you weave enchanting tales filled with wonder and adventure. Let's bring your fantasy world to life together.",
    'sci-fi': "Ready to explore the frontiers of imagination? I'll help you craft compelling science fiction that balances technological innovation with human experience.",
    mystery: "Every great mystery starts with a compelling hook. I'm here to help you craft intricate plots and keep your readers guessing until the very end.",
    romance: "Love stories have the power to touch hearts and transform lives. Together, we'll create authentic relationships and emotional journeys that resonate.",
    thriller: "The art of suspense is all about timing. I'll help you master pacing and tension to keep your readers on the edge of their seats.",
  };

  return scripts[genre as keyof typeof scripts] || 
    "I'm excited to help you bring your unique story to life. Let's work together to craft something extraordinary.";
};

export async function POST(request: Request) {
  try {
    const { genre } = await request.json();
    const script = generateScript(genre);
    
    return NextResponse.json({ script });
  } catch (error) {
    console.error('Error generating script:', error);
    return NextResponse.json(
      { error: 'Failed to generate script' },
      { status: 500 }
    );
  }
}