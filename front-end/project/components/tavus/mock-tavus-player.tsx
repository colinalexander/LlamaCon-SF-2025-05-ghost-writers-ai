'use client';

import { useState, useEffect } from 'react';
import { Volume2, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MockTavusPlayerProps {
  videoId?: string;
  script?: string;
  genre?: string;
  className?: string;
  isConversation?: boolean;
  userName?: string;
}

export default function MockTavusPlayer({ 
  videoId, 
  script, 
  genre = 'fiction', 
  className = '',
  isConversation = false,
  userName
}: MockTavusPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 0.5;
          if (newProgress >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return newProgress;
        });
        
        setCurrentTime((prev) => prev + 0.5);
      }, 500);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const resetPlayback = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className={`aspect-video bg-muted rounded-lg overflow-hidden flex flex-col ${className}`}>
      <div className="flex-1 flex items-center justify-center p-6">
        {isConversation ? (
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Mock Tavus Conversation</h3>
            <p className="text-muted-foreground mb-6">
              {script || `This is a simulated conversation with your ${genre} writing coach.`}
            </p>
            <div className="flex justify-center space-x-4">
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                <Volume2 className="h-12 w-12 text-primary" />
              </div>
              <div className="w-24 h-24 rounded-full bg-secondary/20 flex items-center justify-center">
                <Volume2 className="h-12 w-12 text-secondary" />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Volume2 className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Mock Tavus Player</h3>
            <p className="text-muted-foreground">
              {script || `This is a simulated video for your ${genre} writing coach.`}
            </p>
          </div>
        )}
      </div>
      
      <div className="bg-background/80 backdrop-blur-sm p-4 border-t">
        <div className="flex items-center space-x-2 mb-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={togglePlayback}
            className="h-8 w-8"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <span className="text-xs">{formatTime(currentTime)}</span>
          
          <div className="flex-1 h-2 bg-muted-foreground/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <span className="text-xs">1:30</span>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            Video ID: {videoId || 'mock-tavus-video'}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={resetPlayback}
            className="h-6 text-xs"
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
