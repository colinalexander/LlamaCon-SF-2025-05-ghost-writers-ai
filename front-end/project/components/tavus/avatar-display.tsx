'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Volume2 } from 'lucide-react';
import { toast } from 'sonner';

interface AvatarDisplayProps {
  genre: string;
  script?: string;
}

export default function AvatarDisplay({ genre, script }: AvatarDisplayProps) {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Map genres to specific avatar personalities
  const avatarPersonalities = {
    fantasy: 'mystical and imaginative',
    'sci-fi': 'analytical and forward-thinking',
    mystery: 'intriguing and methodical',
    romance: 'warm and empathetic',
    thriller: 'intense and engaging'
  };

  const generateVideo = async () => {
    try {
      setLoading(true);
      const personality = avatarPersonalities[genre as keyof typeof avatarPersonalities] || 'professional';
      
      const response = await fetch('/api/tavus/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ genre, personality, script }),
      });

      if (!response.ok) throw new Error('Failed to generate video');
      
      const data = await response.json();
      setVideoId(data.videoId);
    } catch (error) {
      toast.error('Failed to generate avatar video');
    } finally {
      setLoading(false);
    }
  };

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

      {videoId ? (
        <div className="aspect-video rounded-lg overflow-hidden bg-muted">
          <iframe
            src={`https://player.tavus.io/${videoId}`}
            className="w-full h-full"
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
          <Volume2 className="h-12 w-12 text-muted-foreground" />
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