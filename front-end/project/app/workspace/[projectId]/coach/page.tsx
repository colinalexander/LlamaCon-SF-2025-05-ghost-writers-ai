'use client';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import WritingCoachSection from '@/components/tavus/writing-coach-section';
import { initializeDatabase } from '@/lib/db';

export default function CoachPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  
  // Initialize database when the page loads
  useEffect(() => {
    initializeDatabase().catch(console.error);
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Writing Coach</h1>
      <div className="max-w-4xl mx-auto">
        <WritingCoachSection projectId={projectId} />
        
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h2 className="text-xl font-semibold mb-2">About Your Writing Coach</h2>
          <p className="text-muted-foreground">
            Your AI writing coach is specialized in your project's genre and can provide personalized 
            feedback, suggestions, and guidance for your writing project. Start a conversation to get help with 
            character development, plot structure, pacing, dialogue, and more.
          </p>
          <p className="text-muted-foreground mt-2">
            After your conversation ends, you'll be able to view the transcript to review the advice and insights.
          </p>
        </div>
      </div>
    </div>
  );
}
