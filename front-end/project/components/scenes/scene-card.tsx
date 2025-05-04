'use client';

import { useState } from 'react';
import { useProject } from '@/lib/project-context';
import { toast } from 'sonner';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { GripVertical, Pencil, Trash2, Wand2 } from 'lucide-react';
import EditSceneForm from './edit-scene-form';
import SceneGenerator from './scene-generator';
import SceneEditor from './scene-editor';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SceneCardProps {
  scene: {
    id: string;
    title: string;
    location: string;
    time: string;
    conflict: string;
    characters_present: string;
    character_changes: string;
    important_actions: string;
    mood: string;
    summary: string;
    content?: string;
  };
  onUpdate: () => void;
}

export default function SceneCard({ scene, onUpdate }: SceneCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const { projectId } = useProject();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: scene.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this scene?')) return;

    try {
      const response = await fetch(
        `/api/workspace/scenes/${scene.id}?projectId=${projectId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Failed to delete scene');

      toast.success('Scene deleted');
      onUpdate();
    } catch (error) {
      toast.error('Failed to delete scene');
    }
  };

  const handleSaveContent = async (content: string) => {
    try {
      const response = await fetch(`/api/workspace/scenes/${scene.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...scene,
          content,
          projectId,
        }),
      });

      if (!response.ok) throw new Error('Failed to save scene content');

      toast.success('Scene content saved');
      onUpdate();
    } catch (error) {
      toast.error('Failed to save scene content');
    }
  };

  const handleSaveGenerated = async (content: string) => {
    try {
      await handleSaveContent(content);
      setIsGenerating(false);
    } catch (error) {
      toast.error('Failed to save generated content');
    }
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="relative">
        <div
          className="absolute left-2 top-1/2 -translate-y-1/2 cursor-move touch-none p-2 opacity-50 hover:opacity-100 transition-opacity"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </div>
        <CardHeader className="pl-12">
          <CardTitle className="flex items-center justify-between">
            <span>{scene.title}</span>
            <div className="flex gap-2">
              <Dialog open={isWriting} onOpenChange={setIsWriting}>
                <DialogTrigger asChild>
                  <Button variant="outline">Write</Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Write Scene: {scene.title}</DialogTitle>
                  </DialogHeader>
                  <SceneEditor
                    sceneId={scene.id}
                    initialContent={scene.content}
                    onSave={handleSaveContent}
                  />
                </DialogContent>
              </Dialog>
              <Dialog open={isGenerating} onOpenChange={setIsGenerating}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Wand2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Generate Scene Content</DialogTitle>
                  </DialogHeader>
                  <SceneGenerator
                    sceneId={scene.id}
                    onSave={handleSaveGenerated}
                  />
                </DialogContent>
              </Dialog>
              <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Scene</DialogTitle>
                  </DialogHeader>
                  <EditSceneForm
                    scene={scene}
                    onSubmit={() => {
                      setIsEditing(false);
                      onUpdate();
                    }}
                  />
                </DialogContent>
              </Dialog>
              <Button variant="ghost" size="icon" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Location & Time</h3>
              <p className="text-sm text-muted-foreground">
                {scene.location} - {scene.time}
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Main Conflict</h3>
              <p className="text-sm text-muted-foreground">{scene.conflict}</p>
            </div>
            <div>
              <h3 className="font-semibold">Characters Present</h3>
              <p className="text-sm text-muted-foreground">{scene.characters_present}</p>
            </div>
            <div>
              <h3 className="font-semibold">Mood</h3>
              <p className="text-sm text-muted-foreground">{scene.mood}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button variant="outline" className="w-full" onClick={() => setIsEditing(true)}>
            View Details
          </Button>
          <Button className="w-full" onClick={() => setIsWriting(true)}>
            Write Scene
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}