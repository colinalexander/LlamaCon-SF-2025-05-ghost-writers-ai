'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Volume2, Camera, Mic, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import MockTavusPlayer from './mock-tavus-player';
import { useMockTavusPlayer, recordTavusConnectionIssue } from '@/lib/tavus-utils';
import { pollingRegistry } from '@/lib/polling-registry';

interface AvatarDisplayProps {
  genre: string;
  script?: string;
}

export default function AvatarDisplay({ genre, script }: AvatarDisplayProps) {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Connecting to writing coach...');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [videoStatus, setVideoStatus] = useState<string | null>(null);
  const [processingVideo, setProcessingVideo] = useState(false);
  const [processingTime, setProcessingTime] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const [isForceChecking, setIsForceChecking] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingStartTimeRef = useRef<number | null>(null);

  // Function to directly check the video status with the Tavus API
  const forceCheckVideoStatus = async (id: string) => {
    if (!id) return;
    
    try {
      setIsForceChecking(true);
      console.log(`Force checking video status for ID: ${id}`);
      
      const response = await fetch(`/api/tavus/video/check/${id}`);
      
      if (!response.ok) {
        console.error('Failed to force check video status:', response.status);
        toast.error('Failed to check video status. Please try again.');
        setIsForceChecking(false);
        return;
      }
      
      const data = await response.json();
      console.log('Force check response:', data);
      
      // If the video is ready, show it
      if (data.status === 'ready') {
        console.log(`Video ${id} is ready after force check`);
        
        // Use the hostedUrl from the response, which might be different from what we had before
        // (could be stream_url or download_url instead of hosted_url)
        setVideoUrl(data.hostedUrl);
        setVideoStatus('ready');
        setProcessingVideo(false);
        setTimedOut(false);
        
        toast.success('Video is ready!');
      } else if (data.status === 'generating') {
        // If the video is still generating, show a more specific message
        console.log(`Video ${id} is still generating after force check`);
        toast.info(`Video is still generating. Progress: ${data.generation_progress || 'unknown'}`);
      } else {
        // If the video is in any other state, show a generic message
        console.log(`Video ${id} is in state ${data.status} after force check`);
        toast.info(`Video is still processing (${data.status}). Please try again later.`);
      }
    } catch (error) {
      console.error('Error force checking video status:', error);
      toast.error('Failed to check video status. Please try again.');
    } finally {
      setIsForceChecking(false);
    }
  };

  // Map genres to specific avatar personalities
  const avatarPersonalities = {
    fantasy: 'mystical and imaginative',
    'sci-fi': 'analytical and forward-thinking',
    mystery: 'intriguing and methodical',
    romance: 'warm and empathetic',
    thriller: 'intense and engaging'
  };

  // List of known problematic video IDs to ignore
  const BLOCKED_VIDEO_IDS = [
    'rf4703150052-1746344163874'
  ];
  
  // Maximum polling duration in seconds (reduced for testing)
  const MAX_POLLING_DURATION = 10;
  
  // Function to check video status
  const checkVideoStatus = async (id: string) => {
    // Skip checking for known problematic video IDs
    if (BLOCKED_VIDEO_IDS.includes(id)) {
      console.log(`AvatarDisplay: Skipping check for known problematic video ID: ${id}`);
      
      // Unregister from the polling registry
      pollingRegistry.unregisterPolling(id);
      
      // Also clear the interval directly as a fallback
      if (pollingIntervalRef.current) {
        console.log('Clearing polling interval for blocked ID');
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      
      setProcessingVideo(false);
      setVideoId(null);
      return;
    }
    
    // Check if we've exceeded the maximum polling duration
    if (processingTime > MAX_POLLING_DURATION) {
      console.log(`AvatarDisplay: Exceeded maximum polling duration (${MAX_POLLING_DURATION}s) for video ID: ${id}`);
      
      // Unregister from the polling registry
      pollingRegistry.unregisterPolling(id);
      
      // Also clear the interval directly as a fallback
      if (pollingIntervalRef.current) {
        console.log('Clearing polling interval due to timeout');
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      
      // Set the timed out state to true
      setTimedOut(true);
      
      // Make one final direct check with the Tavus API
      forceCheckVideoStatus(id);
      
      return;
    }
    
    // Debug: Log the video ID being checked
    console.log(`AvatarDisplay: Checking status for video ID: ${id} (${processingTime}s elapsed)`);
    
    try {
      const response = await fetch(`/api/tavus/video/status/${id}`);
      
      if (!response.ok) {
        console.error('Failed to fetch video status:', response.status);
        
        // If we get a 404, 410, or 429, stop polling immediately
        if (response.status === 404 || response.status === 410 || response.status === 429) {
          console.log(`Video not found, blocked, or rate limited (${response.status}), stopping polling for ID:`, id);
          
          // Unregister from the polling registry
          pollingRegistry.unregisterPolling(id);
          
          // Also clear the interval directly as a fallback
          if (pollingIntervalRef.current) {
            console.log('Clearing polling interval');
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          
          setProcessingVideo(false);
          
          // Show appropriate error message based on status code
          if (response.status === 429) {
            toast.error('Rate limit exceeded. Please try again later.');
          } else {
            toast.error('Video not found. Please try again.');
          }
          
          // Debug: Clear the video ID to prevent further polling
          setVideoId(null);
          return;
        }
        
        // If we get a 500 error, it might be because the database table doesn't exist yet
        // or there's another server-side issue. We'll continue polling but won't show an error.
        if (response.status === 500) {
          console.log('Server error when checking video status. Will retry...');
          return;
        }
        
        return;
      }
      
      const data = await response.json();
      setVideoStatus(data.status);
      
      // If the video is ready, stop polling and show the video
      if (data.status === 'ready') {
        console.log(`Video ${id} is ready, stopping polling`);
        
        // Unregister from the polling registry
        pollingRegistry.unregisterPolling(id);
        
        // Also clear the interval directly as a fallback
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        
        setProcessingVideo(false);
        setVideoUrl(data.hostedUrl);
      } else if (data.status === 'failed') {
        console.log(`Video ${id} failed, stopping polling`);
        
        // Unregister from the polling registry
        pollingRegistry.unregisterPolling(id);
        
        // Also clear the interval directly as a fallback
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        
        setProcessingVideo(false);
        toast.error('Video generation failed. Please try again.');
      }
    } catch (error) {
      console.error('Error checking video status:', error);
      
      // Don't show errors to the user during polling, just log them
      // We'll continue polling in case the error is temporary
    }
  };

  const generateVideo = async () => {
    try {
      // Clear any existing polling
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      
      setLoading(true);
      setLoadingMessage('Connecting to writing coach...');
      setLoadingProgress(0);
      setProcessingVideo(false);
      setVideoStatus(null);
      setProcessingTime(0);
      
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
          setLoadingMessage('Creating your writing coach avatar...');
        } else if (loadingProgress > 60) {
          setLoadingMessage('Almost ready! This may take a few more seconds...');
        }
      }, 1000);
      
      const personality = avatarPersonalities[genre as keyof typeof avatarPersonalities] || 'professional';
      
      const response = await fetch('/api/tavus/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ genre, personality, script }),
      });

      clearInterval(progressInterval);
      setLoadingProgress(100);
      
      if (!response.ok) throw new Error('Failed to generate video');
      
      const data = await response.json();
      setVideoId(data.videoId);
      
      // If the video is already ready, show it
      if (data.status === 'ready') {
        setVideoUrl(data.videoUrl);
        setVideoStatus('ready');
      } else {
        // Otherwise, start polling for status
        setVideoStatus(data.status || 'queued');
        setProcessingVideo(true);
        
        // Set the polling start time
        pollingStartTimeRef.current = Date.now();
        console.log(`Setting polling start time: ${pollingStartTimeRef.current}`);
        
        // Start polling for video status
        const intervalId = setInterval(() => {
          if (data.videoId) {
            // Calculate elapsed time based on absolute timestamp
            const elapsedSeconds = pollingStartTimeRef.current 
              ? Math.floor((Date.now() - pollingStartTimeRef.current) / 1000)
              : 0;
            
            // Update the processing time display
            setProcessingTime(elapsedSeconds);
            
            // Check if we've exceeded the maximum polling duration
            if (elapsedSeconds > MAX_POLLING_DURATION) {
              console.log(`TIMEOUT: Exceeded maximum polling duration (${MAX_POLLING_DURATION}s) for video ID: ${data.videoId}`);
              console.log(`Current time: ${Date.now()}, Start time: ${pollingStartTimeRef.current}`);
              
              // Unregister from the polling registry
              pollingRegistry.unregisterPolling(data.videoId);
              
              // Clear the interval
              clearInterval(intervalId);
              pollingIntervalRef.current = null;
              
              // Set the timed out state to true
              setTimedOut(true);
              setProcessingVideo(false);
              
              // Make one final direct check with the Tavus API
              forceCheckVideoStatus(data.videoId);
              
              return;
            }
            
            // Check video status
            checkVideoStatus(data.videoId);
            
            // Update last checked time in registry
            pollingRegistry.updateLastChecked(data.videoId);
          }
        }, 1000);
        
        // Store the interval reference
        pollingIntervalRef.current = intervalId;
        
        // Register with the polling registry
        pollingRegistry.registerPolling(data.videoId, intervalId);
        
        console.log(`Registered polling for video ID ${data.videoId} with registry`);
        console.log(`Active polling count: ${pollingRegistry.getActiveCount()}`);
      }
    } catch (error) {
      toast.error('Failed to generate avatar video');
    } finally {
      setLoading(false);
    }
  };

  // Clean up polling interval on unmount
  useEffect(() => {
    return () => {
      if (videoId && pollingIntervalRef.current) {
        console.log(`Component unmounting, cleaning up polling for video ID: ${videoId}`);
        
        // Unregister from the polling registry
        pollingRegistry.unregisterPolling(videoId);
        
        // Also clear the interval directly as a fallback
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [videoId]);

  // Check for existing video ID in localStorage
  useEffect(() => {
    // Clear any stale video IDs from localStorage
    localStorage.removeItem('tavus_video_id');
  }, []);

  useEffect(() => {
    if (script) {
      generateVideo();
    }
  }, [script]);

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Your Writing Coach</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={generateVideo}
          disabled={loading || !script}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Regenerate
        </Button>
      </div>

      {videoId && videoUrl ? (
        useMockTavusPlayer() ? (
          <MockTavusPlayer 
            videoId={videoId} 
            script={script} 
            genre={genre} 
          />
        ) : (
          <div className="aspect-video rounded-lg overflow-hidden bg-muted relative">
            <iframe
              src={videoUrl}
              className="w-full h-full"
              allow="camera; microphone; autoplay; fullscreen"
              allowFullScreen
              onError={() => {
                console.error("Failed to load Tavus player");
                setIframeError(true);
                recordTavusConnectionIssue();
              }}
              onLoad={() => setIframeError(false)}
            />
            {/* Fallback content that will be visible if iframe fails to load */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center bg-muted z-10 p-6 transition-opacity duration-300 ${iframeError ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <h4 className="text-lg font-medium mb-2">Your Writing Coach</h4>
              <p className="text-sm text-muted-foreground text-center px-4 mb-2">
                We're having trouble connecting to the Tavus video service.
              </p>
              <p className="text-sm text-muted-foreground text-center px-4">
                Your writing coach says: "{script || "I'm here to help with your project!"}"
              </p>
            </div>
          </div>
        )
      ) : videoId && timedOut ? (
        <div className="aspect-video rounded-lg bg-muted flex flex-col items-center justify-center p-4">
          <div className="flex items-center space-x-2 mb-4">
            <AlertCircle className="h-6 w-6 text-amber-500" />
            <Camera className="h-6 w-6 text-muted-foreground" />
          </div>
          <h4 className="text-lg font-medium mb-2">Video Processing Timeout</h4>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Your writing coach video is taking longer than expected to process.
            The video might be ready on Tavus's servers but our system hasn't detected it yet.
          </p>
          <Button
            variant="default"
            size="sm"
            onClick={() => videoId && forceCheckVideoStatus(videoId)}
            disabled={isForceChecking}
            className="mb-2"
          >
            {isForceChecking ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Force Check Status
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-2 text-center max-w-xs">
            Click the button above to check if your video is ready on Tavus's servers.
          </p>
          <p className="text-xs text-muted-foreground mt-2 text-center max-w-xs">
            If the video is still not ready, you can try regenerating it.
          </p>
        </div>
      ) : processingVideo ? (
        <div className="aspect-video rounded-lg bg-muted flex flex-col items-center justify-center p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="h-6 w-6 text-primary animate-pulse" />
            <Camera className="h-6 w-6 text-muted-foreground" />
          </div>
          <h4 className="text-lg font-medium mb-2">Video Processing</h4>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Your writing coach video is being processed. This typically takes 1-2 minutes.
          </p>
          <div className="w-full max-w-xs bg-secondary h-2 rounded-full overflow-hidden mb-2">
            <div 
              className="bg-primary h-full transition-all duration-300 ease-in-out"
              style={{ width: `${Math.min(processingTime / 120 * 100, 95)}%` }}
            ></div>
          </div>
          <p className="text-xs text-muted-foreground">
            Status: {videoStatus || 'Processing'} ({processingTime}s)
          </p>
          <p className="text-xs text-muted-foreground mt-4 text-center max-w-xs">
            The video will automatically appear when it's ready. Please don't refresh the page.
          </p>
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
            Note: When the video loads, you may be asked to allow camera and microphone access for interactive features.
          </p>
        </div>
      ) : (
        <div className="aspect-video rounded-lg bg-muted flex flex-col items-center justify-center p-4">
          <Volume2 className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground text-center">
            Your writing coach is preparing to assist you with your {genre} project.
          </p>
        </div>
      )}

      {script && (
        <div className="mt-4">
          <h4 className="font-medium mb-2">Current Script</h4>
          <p className="text-sm text-muted-foreground">{script}</p>
        </div>
      )}
    </Card>
  );
}
