'use client';

import { useState, useEffect } from 'react';
import { useProject } from '@/lib/project-context';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lock, Edit2, Share2, Plus, BookPlus } from 'lucide-react';
import NewMemoryDialog from './new-memory-dialog';
import MemorySection from './memory-section';

interface MemoryEntry {
  id: string;
  text: string;
  category: string;
  locked?: boolean;
}

interface Scene {
  id: string;
  title: string;
  scene_order: number;
}

interface MemoryInspectorProps {
  sceneId: string;
}

export default function MemoryInspector({ sceneId }: MemoryInspectorProps) {
  const [memories, setMemories] = useState<Record<string, MemoryEntry[]>>({
    characters: [],
    world: [],
    plot: [],
    style: [],
  });
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScene, setSelectedScene] = useState(sceneId);
  const [isNewMemoryOpen, setIsNewMemoryOpen] = useState(false);
  const { projectId } = useProject();

  useEffect(() => {
    if (projectId) {
      fetchScenes();
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId && selectedScene) {
      fetchMemories();
    }
  }, [projectId, selectedScene]);

  const fetchScenes = async () => {
    try {
      const response = await fetch(`/api/workspace/scenes?projectId=${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch scenes');
      const data = await response.json();
      setScenes(data.sort((a: Scene, b: Scene) => a.scene_order - b.scene_order));
    } catch (error) {
      toast.error('Failed to load scenes');
    }
  };

  const fetchMemories = async () => {
    try {
      const response = await fetch(`/api/workspace/scenes/${selectedScene}/memory?projectId=${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch memories');
      const data = await response.json();
      
      // Group memories by category
      const grouped = data.reduce((acc: Record<string, MemoryEntry[]>, memory: MemoryEntry) => {
        if (!acc[memory.category]) acc[memory.category] = [];
        acc[memory.category].push(memory);
        return acc;
      }, {
        characters: [],
        world: [],
        plot: [],
        style: [],
      });
      
      setMemories(grouped);
    } catch (error) {
      toast.error('Failed to load memories');
    } finally {
      setLoading(false);
    }
  };

  const handleNewMemory = async (entry: Omit<MemoryEntry, 'id'>) => {
    try {
      const response = await fetch(`/api/workspace/scenes/${selectedScene}/memory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...entry,
          projectId,
        }),
      });

      if (!response.ok) throw new Error('Failed to create memory');
      
      toast.success('Memory entry added');
      setIsNewMemoryOpen(false);
      fetchMemories();
    } catch (error) {
      toast.error('Failed to add memory entry');
    }
  };

  const handleCompareScene = () => {
    // Implement scene comparison logic
    toast.info('Scene comparison coming soon');
  };

  const handleCreateScene = () => {
    // Navigate to scene creation
    window.location.href = `/workspace/${projectId}/scenes`;
  };

  if (scenes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <p className="text-muted-foreground">No scenes available</p>
        <Button onClick={handleCreateScene}>
          <BookPlus className="h-4 w-4 mr-2" />
          Create First Scene
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Memory Inspector</h2>
        <Dialog open={isNewMemoryOpen} onOpenChange={setIsNewMemoryOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Memory Entry
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Memory Entry</DialogTitle>
            </DialogHeader>
            <NewMemoryDialog onSubmit={handleNewMemory} onCancel={() => setIsNewMemoryOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={selectedScene} onValueChange={setSelectedScene}>
        <TabsList className="w-full flex overflow-x-auto">
          {scenes.map((scene) => (
            <TabsTrigger
              key={scene.id}
              value={scene.id}
              className="flex-1 min-w-[120px]"
            >
              {scene.title}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Memory Timeline</h3>
          <div className="space-y-4">
            <MemorySection
              title="Characters"
              entries={memories.characters}
              onEdit={() => {/* Implement edit */}}
            />
            <MemorySection
              title="World Facts"
              entries={memories.world}
              onEdit={() => {/* Implement edit */}}
            />
            <MemorySection
              title="Plot Points"
              entries={memories.plot}
              onEdit={() => {/* Implement edit */}}
            />
            <MemorySection
              title="Style Notes"
              entries={memories.style}
              onEdit={() => {/* Implement edit */}}
            />
          </div>
        </Card>

        <div className="flex gap-4">
          <Input
            placeholder="Search Memory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button variant="outline" onClick={handleCompareScene}>
            Compare Scene
          </Button>
        </div>
      </div>
    </div>
  );
}