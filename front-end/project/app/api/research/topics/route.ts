import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface ResearchTopic {
  title: string;
  description: string;
  relevance: string;
}

const generateTopics = (sceneTitle: string, genre: string): ResearchTopic[] => {
  // Genre-specific research suggestions
  const genreTopics: Record<string, ResearchTopic[]> = {
    fantasy: [
      {
        title: 'Medieval Warfare Tactics',
        description: 'Understanding battle formations, siege warfare, and castle defense strategies from the Middle Ages.',
        relevance: 'Essential for authentic combat scenes',
      },
      {
        title: 'Ancient Mythology Patterns',
        description: 'Common mythological structures and archetypal elements across different cultures.',
        relevance: 'Helps build believable fantasy worlds',
      },
      {
        title: 'Historical Magic Systems',
        description: 'How different cultures viewed and practiced magic throughout history.',
        relevance: 'Inspiration for magical elements',
      },
    ],
    'sci-fi': [
      {
        title: 'Current Space Technology',
        description: 'Latest developments in space exploration, propulsion systems, and spacecraft design.',
        relevance: 'Grounds sci-fi elements in reality',
      },
      {
        title: 'Emerging AI Concepts',
        description: 'Current trends and ethical considerations in artificial intelligence development.',
        relevance: 'Adds depth to AI characters/systems',
      },
      {
        title: 'Future City Planning',
        description: 'Urban development theories and sustainable city designs for the future.',
        relevance: 'Helps create believable future settings',
      },
    ],
    mystery: [
      {
        title: 'Police Procedures',
        description: 'Standard investigation methods, evidence handling, and detective work protocols.',
        relevance: 'Ensures procedural accuracy',
      },
      {
        title: 'Criminal Psychology',
        description: 'Understanding motivations, patterns, and behavioral analysis in criminal cases.',
        relevance: 'Helps create believable suspects',
      },
      {
        title: 'Forensic Techniques',
        description: 'Modern forensic methods and their applications in solving crimes.',
        relevance: 'Adds technical authenticity',
      },
    ],
  };

  // Return genre-specific topics or generic ones if genre not found
  return genreTopics[genre] || [
    {
      title: 'Character Development',
      description: 'Psychological principles for creating deep, believable characters.',
      relevance: 'Universal storytelling element',
    },
    {
      title: 'Scene Structure',
      description: 'Techniques for building tension and pacing in individual scenes.',
      relevance: 'Improves scene dynamics',
    },
    {
      title: 'Dialogue Writing',
      description: 'Methods for crafting natural, engaging dialogue between characters.',
      relevance: 'Enhances character interactions',
    },
  ];
};

export async function POST(request: Request) {
  try {
    const { sceneTitle, genre } = await request.json();
    const topics = generateTopics(sceneTitle, genre);
    
    return NextResponse.json({ topics });
  } catch (error) {
    console.error('Error generating research topics:', error);
    return NextResponse.json(
      { error: 'Failed to generate research topics' },
      { status: 500 }
    );
  }
}