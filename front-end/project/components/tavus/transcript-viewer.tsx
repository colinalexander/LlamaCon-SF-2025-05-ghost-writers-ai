'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface TranscriptViewerProps {
  conversationId: string;
}

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface TranscriptResponse {
  transcript: {
    messages: Message[];
    status?: string;
    url?: string;
  };
  isComplete: boolean;
  statusOnly: boolean;
}

export default function TranscriptViewer({ conversationId }: TranscriptViewerProps) {
  const [transcript, setTranscript] = useState<Message[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [isStatusOnly, setIsStatusOnly] = useState(false);
  const [conversationStatus, setConversationStatus] = useState<string | null>(null);

  const fetchTranscript = async () => {
    if (!conversationId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/tavus/transcript/${conversationId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          toast.info('Transcript not available yet. It may take a few minutes after the conversation ends.');
          return;
        }
        throw new Error('Failed to fetch transcript');
      }
      
      const data: TranscriptResponse = await response.json();
      
      // Check if this is just status information
      if (data.statusOnly) {
        setIsStatusOnly(true);
        setConversationStatus(data.transcript.status || 'created');
      } else {
        setIsStatusOnly(false);
      }
      
      setTranscript(data.transcript.messages);
    } catch (error) {
      console.error('Error fetching transcript:', error);
      toast.error('Failed to load conversation transcript');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (conversationId) {
      fetchTranscript();
    }
  }, [conversationId]);

  if (!conversationId) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">No conversation selected</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Conversation Transcript</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchTranscript}
          disabled={loading}
        >
          {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ) : isStatusOnly ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Transcript Not Ready</AlertTitle>
          <AlertDescription>
            Your conversation has been {conversationStatus}, but the transcript is not available yet. 
            Transcripts are typically available a few minutes after the conversation ends.
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTranscript}
              className="mt-2 w-full"
            >
              Check Again
            </Button>
          </AlertDescription>
        </Alert>
      ) : transcript ? (
        <div className="space-y-4 max-h-[500px] overflow-y-auto">
          {transcript.map((message, index) => (
            <div 
              key={index}
              className={`p-3 rounded-lg ${
                message.role === 'assistant' 
                  ? 'bg-primary/10 ml-4' 
                  : message.role === 'user'
                    ? 'bg-muted mr-4'
                    : 'bg-secondary/20 italic text-xs'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="font-semibold text-xs text-muted-foreground">
                  {message.role === 'assistant' ? 'Writing Coach' : message.role === 'user' ? 'You' : 'System'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="mt-1">{message.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">
          Transcript not available yet. It will be available shortly after the conversation ends.
        </p>
      )}
    </Card>
  );
}
