'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProject } from '@/lib/project-context';
import { useAuth } from '@/lib/auth-context';
import WritingCoachConversation from './writing-coach-conversation';
import TranscriptViewer from './transcript-viewer';
import { getAllGenres, BookInfo } from '@/lib/tavus-prompts';

interface WritingCoachSectionProps {
  projectId?: string;
}

export default function WritingCoachSection({ projectId }: WritingCoachSectionProps) {
  const { projectId: contextProjectId } = useProject();
  const [activeTab, setActiveTab] = useState<string>('conversation');
  const [genre, setGenre] = useState<string>('fantasy');
  const [bookInfo, setBookInfo] = useState<BookInfo | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const effectiveProjectId = projectId || contextProjectId;
  
  // Fetch project data to get the genre
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!effectiveProjectId) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/projects/${effectiveProjectId}`);
        if (!response.ok) throw new Error('Failed to fetch project');
        
        const data = await response.json();
        if (data.genre) {
          setGenre(data.genre);
          
          // Create book info object from project data
          const projectBookInfo: BookInfo = {
            genre: data.genre,
            audience: data.audience,
            style: data.style,
            storyLength: data.story_length,
            title: data.title,
            description: data.description,
            tone: data.tone
          };
          
          setBookInfo(projectBookInfo);
        }
      } catch (error) {
        console.error('Error fetching project data:', error);
        // Keep default genre if there's an error
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjectData();
  }, [effectiveProjectId]);
  
  // This function will be passed to the WritingCoachConversation component
  // to receive the conversationId when a conversation is created
  const handleConversationCreated = (id: string) => {
    setConversationId(id);
    // Optionally switch to the transcript tab after a delay
    // setTimeout(() => setActiveTab('transcript'), 60000); // Switch after 1 minute
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Writing Coach</CardTitle>
        <CardDescription>
          Get personalized guidance from an AI writing coach specialized in your genre
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="conversation">Conversation</TabsTrigger>
            <TabsTrigger value="transcript" disabled={!conversationId}>Transcript</TabsTrigger>
          </TabsList>
          <TabsContent value="conversation" className="mt-4">
            <WritingCoachConversation 
              genre={genre} 
              bookInfo={bookInfo || undefined}
              onConversationCreated={handleConversationCreated}
            />
          </TabsContent>
          <TabsContent value="transcript" className="mt-4">
            {conversationId ? (
              <TranscriptViewer conversationId={conversationId} />
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Start a conversation with your writing coach to generate a transcript
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
