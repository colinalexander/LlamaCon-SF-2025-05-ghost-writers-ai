'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProject } from '@/lib/project-context';
import { useAuth } from '@/lib/auth-context';
import { BookInfo } from '@/lib/tavus-prompts';
import { toast } from 'sonner';
import MockTavusPlayer from './mock-tavus-player';
import { useMockTavusPlayer, recordTavusConnectionIssue } from '@/lib/tavus-utils';
import { RefreshCw, Camera, Mic, FileText, Clock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface WritingCoachConversationProps {
  genre: string;
  bookInfo?: BookInfo;
  onConversationCreated?: (id: string) => void;
}

export default function WritingCoachConversation({ 
  genre, 
  bookInfo,
  onConversationCreated 
}: WritingCoachConversationProps) {
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('Connecting to writing coach...');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [transcriptReady, setTranscriptReady] = useState(false);
  const [checkingTranscript, setCheckingTranscript] = useState(false);
  const { projectId } = useProject();
  const { user } = useAuth();

  // Check if transcript is available
  const checkTranscriptStatus = async () => {
    if (!conversationId) return;
    
    try {
      setCheckingTranscript(true);
      const response = await fetch(`/api/tavus/transcript/${conversationId}`);
      
      if (!response.ok) {
        // If 404 or other error, transcript definitely not ready
        setTranscriptReady(false);
        return;
      }
      
      const data = await response.json();
      
      // If statusOnly is false, we have a full transcript
      setTranscriptReady(!data.statusOnly);
    } catch (error) {
      console.error('Error checking transcript status:', error);
      setTranscriptReady(false);
    } finally {
      setCheckingTranscript(false);
    }
  };

  // Check transcript status when conversation ID changes
  useEffect(() => {
    if (conversationId) {
      checkTranscriptStatus();
      
      // Set up an interval to check every 30 seconds
      const intervalId = setInterval(checkTranscriptStatus, 30000);
      
      // Clean up interval on unmount or when conversation ID changes
      return () => clearInterval(intervalId);
    }
  }, [conversationId]);

  const startConversation = async () => {
    if (!projectId) {
      toast.error('No project selected');
      return;
    }

    try {
      setLoading(true);
      setLoadingMessage('Connecting to writing coach...');
      setLoadingProgress(0);
      setApiError(null);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
        
        // Update loading message based on progress
        if (loadingProgress > 30 && loadingProgress <= 60) {
          setLoadingMessage('Creating your interactive writing coach session...');
        } else if (loadingProgress > 60) {
          setLoadingMessage('Almost ready! This may take a few more seconds...');
        }
      }, 1000);
      
      // Prepare the book info if it doesn't exist
      const effectiveBookInfo: BookInfo = bookInfo || { genre };
      
      // Get the user's name if available
      const userName = user?.firstName && user?.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user?.firstName || user?.username;
      
      const response = await fetch('/api/tavus/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          genre, 
          projectId,
          bookInfo: effectiveBookInfo,
          userName
        }),
      });

      clearInterval(progressInterval);
      setLoadingProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Tavus API error:', errorData);
        setApiError('Failed to create conversation');
        throw new Error('Failed to create conversation');
      }
      
      const data = await response.json();
      
      if (!data.conversationUrl) {
        setApiError('Invalid response from Tavus API');
        throw new Error('Invalid response from Tavus API');
      }
      
      setConversationUrl(data.conversationUrl);
      setConversationId(data.conversationId);
      setApiError(null);
      
      // Notify parent component about the new conversation
      if (onConversationCreated && data.conversationId) {
        onConversationCreated(data.conversationId);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to connect with writing coach');
      setApiError('Failed to connect with writing coach');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Your Writing Coach</h3>
        {!conversationUrl && (
          <Button
            onClick={startConversation}
            disabled={loading || !projectId}
          >
            {loading ? 'Connecting...' : 'Connect with Writing Coach'}
          </Button>
        )}
      </div>

      {apiError ? (
        <div className="aspect-video rounded-lg bg-muted flex items-center justify-center flex-col p-6 text-center">
          <p className="text-muted-foreground mb-4">
            We encountered an error connecting to the writing coach service:
          </p>
          <p className="text-sm text-muted-foreground font-medium text-red-500">
            {apiError}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={startConversation}
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      ) : loading ? (
        <div className="aspect-video rounded-lg bg-muted flex flex-col items-center justify-center p-4">
          <div className="flex items-center space-x-2 mb-4">
            <RefreshCw className="h-6 w-6 text-primary animate-spin" />
            <Camera className="h-6 w-6 text-muted-foreground" />
            <Mic className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-center mb-2">
            {loadingMessage}
          </p>
          <div className="w-full max-w-xs bg-secondary h-2 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-300 ease-in-out"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-center max-w-xs">
            Note: When the conversation loads, you will be asked to allow camera and microphone access for interactive features.
          </p>
        </div>
      ) : conversationUrl ? (
        useMockTavusPlayer() ? (
          <MockTavusPlayer 
            videoId={conversationId || undefined} 
            script={`Hello ${user?.firstName || 'there'}! I'm your ${genre} writing coach${bookInfo?.title ? ` helping with "${bookInfo.title}"` : ''}.${bookInfo?.description ? ` Your story about "${bookInfo.description}" sounds fascinating.` : ''} What would you like to discuss today?`} 
            genre={genre} 
            isConversation={true}
            userName={user?.firstName || user?.username}
          />
        ) : (
          <div className="aspect-video rounded-lg overflow-hidden bg-muted relative">
            <iframe
              src={conversationUrl}
              className="w-full h-full"
              allow="camera; microphone; autoplay; fullscreen"
              allowFullScreen
              onError={() => {
                console.error("Failed to load Tavus conversation");
                setIframeError(true);
                recordTavusConnectionIssue();
              }}
              onLoad={() => setIframeError(false)}
            />
            {/* Fallback content that will be visible if iframe fails to load */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center bg-muted z-10 p-6 transition-opacity duration-300 ${iframeError ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <h4 className="text-lg font-medium mb-4">Connection Issue</h4>
              <p className="text-sm text-muted-foreground text-center px-4 mb-4">
                We're having trouble connecting to the Tavus conversation service.
              </p>
              <p className="text-sm text-muted-foreground text-center px-4">
                Your writing coach is still available to help with your {genre} project. Please try again later or contact support if the issue persists.
              </p>
            </div>
          </div>
        )
      ) : (
        <div className="aspect-video rounded-lg bg-muted flex items-center justify-center flex-col p-6 text-center">
          <div className="flex items-center space-x-2 mb-4">
            <Camera className="h-6 w-6 text-muted-foreground" />
            <Mic className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">
            Connect with your writing coach to get personalized feedback and guidance on your {genre} project.
          </p>
          <p className="text-sm text-muted-foreground">
            Your coach will help you develop characters, plot, pacing, and more through an interactive video conversation.
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            Note: You will need to allow camera and microphone access for this feature.
          </p>
        </div>
      )}

      {conversationId && (
        <div className="mt-4 flex justify-between items-center">
          <div className="text-xs text-muted-foreground flex items-center">
            {checkingTranscript ? (
              <>
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Checking transcript status...
              </>
            ) : !transcriptReady ? (
              <>
                <Clock className="h-3 w-3 mr-1" />
                Transcript is being generated. This may take several minutes after the conversation ends.
              </>
            ) : (
              <>
                <FileText className="h-3 w-3 mr-1" />
                Transcript is ready
              </>
            )}
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/api/tavus/transcript/${conversationId}`, '_blank')}
                    disabled={!transcriptReady}
                  >
                    {checkingTranscript ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        View Transcript
                      </>
                    )}
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {!transcriptReady 
                  ? "Transcript is being generated and will be available a few minutes after the conversation ends" 
                  : "View the full transcript of your conversation"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </Card>
  );
}
