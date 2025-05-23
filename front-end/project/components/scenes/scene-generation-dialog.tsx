'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2, SparklesIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface SceneGenerationDialogProps {
  sceneId: string;
  projectId: string;
  onGeneratedContent: (content: string) => void;
}

export default function SceneGenerationDialog({
  sceneId,
  projectId,
  onGeneratedContent,
}: SceneGenerationDialogProps) {
  const [open, setOpen] = useState(false);
  const [wordCount, setWordCount] = useState(1000);
  const [includeMemory, setIncludeMemory] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sceneContext, setSceneContext] = useState<{
    scene?: any;
    characters?: any[];
    memory?: any[];
  }>({characters: [], memory: []});
  const [isLoadingContext, setIsLoadingContext] = useState(false);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      
      console.log('Generating scene with projectId:', projectId, 'sceneId:', sceneId);
      
      // Get user ID from cookies
      const cookies = document.cookie.split('; ');
      const userIdCookie = cookies.find(cookie => cookie.startsWith('userId='));
      const userId = userIdCookie ? userIdCookie.split('=')[1] : null;

      if (!userId) {
        console.error('No userId found in cookies');
        throw new Error('User authentication required');
      }
      
      console.log('Generating scene with projectId:', projectId, 'sceneId:', sceneId, 'userId:', userId);
      
      const response = await fetch(`/api/workspace/scenes/${sceneId}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-project-id': projectId,
          'x-user-id': userId
        },
        body: JSON.stringify({
          wordTarget: wordCount,
          projectId,
          includeMemory
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Scene generation error response:', response.status, errorData);
        throw new Error(`Failed to generate scene: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      
      // Insert the generated text into editor
      onGeneratedContent(data.text);
      
      // Close dialog and show success message
      setOpen(false);
      toast.success('Scene generated successfully!');
    } catch (error) {
      console.error('Error generating scene:', error);
      toast.error('Failed to generate scene. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Fetch scene context when dialog is opened
  useEffect(() => {
    if (open && sceneId && projectId) {
      fetchSceneContext();
    }
  }, [open, sceneId, projectId]);

  const fetchSceneContext = async () => {
    try {
      setIsLoadingContext(true);
      const response = await fetch(`/api/workspace/scenes/${sceneId}/context?projectId=${projectId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch scene context');
      }
      
      const data = await response.json();
      setSceneContext(data);
    } catch (error) {
      console.error('Error fetching scene context:', error);
      toast.error('Failed to load scene context');
    } finally {
      setIsLoadingContext(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <SparklesIcon className="h-4 w-4" />
          Generate with AI
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate Scene Content</DialogTitle>
          <DialogDescription>
            Use AI to generate scene content based on your settings.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="wordCount">Word Count: {wordCount}</Label>
            <Slider
              id="wordCount"
              min={500}
              max={5000}
              step={100}
              value={[wordCount]}
              onValueChange={(values) => setWordCount(values[0])}
            />
            <span className="text-xs text-muted-foreground">
              Slide to select target word count (500-5000)
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="includeMemory">Include Scene Memory</Label>
            <Switch
              id="includeMemory"
              checked={includeMemory}
              onCheckedChange={setIncludeMemory}
            />
          </div>
          
          <div className="border p-3 rounded-md bg-muted/50">
            <p className="text-sm text-muted-foreground">
              AI will generate scene content that matches your scene's title, characters, and settings.
              Using scene memory helps maintain consistency with previous events.
            </p>
          </div>
          
          {/* Scene Context Display */}
          <div className="border p-3 rounded-md">
            <h4 className="text-sm font-medium mb-2">Scene Context</h4>
            {isLoadingContext ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Loading context...</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div>
                  <h5 className="text-xs font-semibold">Characters Present</h5>
                  {sceneContext.characters && sceneContext.characters.length > 0 ? (
                    <div className="text-xs">
                      {sceneContext.characters.map((char: any) => (
                        <span key={char.id} className="inline-block bg-muted rounded-full px-2 py-1 text-xs mr-1 mb-1">
                          {char.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No characters specified</p>
                  )}
                </div>
                
                <div>
                  <h5 className="text-xs font-semibold">Scene Memory</h5>
                  {sceneContext.memory && sceneContext.memory.length > 0 ? (
                    <div className="text-xs max-h-[100px] overflow-y-auto">
                      {sceneContext.memory.map((item: any) => (
                        <div key={item.id} className="border-l-2 border-muted pl-2 mb-1">
                          <p className="line-clamp-1">{item.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No memory entries found</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Scene'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
