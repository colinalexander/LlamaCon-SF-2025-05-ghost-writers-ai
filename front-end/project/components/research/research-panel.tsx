'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, BookOpen, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface ResearchTopic {
  title: string;
  description: string;
  relevance: string;
}

interface ResearchPanelProps {
  sceneTitle: string;
  genre: string;
}

export default function ResearchPanel({ sceneTitle, genre }: ResearchPanelProps) {
  const [topics, setTopics] = useState<ResearchTopic[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/research/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sceneTitle, genre }),
      });

      if (!response.ok) throw new Error('Failed to fetch research topics');
      const data = await response.json();
      setTopics(data.topics);
    } catch (error) {
      toast.error('Failed to load research topics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sceneTitle && genre) {
      fetchTopics();
    }
  }, [sceneTitle, genre]);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Research Assistant</h2>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={fetchTopics}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refresh research topics</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <ScrollArea className="h-[500px] pr-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4 bg-muted animate-pulse">
                <div className="h-6 w-2/3 bg-muted-foreground/20 rounded mb-2" />
                <div className="h-16 w-full bg-muted-foreground/20 rounded" />
              </Card>
            ))}
          </div>
        ) : topics.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No research topics available
          </div>
        ) : (
          <div className="space-y-4">
            {topics.map((topic, index) => (
              <Card key={index} className="p-4 hover:bg-accent/5 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-medium">{topic.title}</h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Relevance: {topic.relevance}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-sm text-muted-foreground">{topic.description}</p>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}