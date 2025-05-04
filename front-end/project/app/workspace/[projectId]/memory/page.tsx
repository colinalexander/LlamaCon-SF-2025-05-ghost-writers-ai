'use client';

import { useEffect, useState } from 'react';
import { useProject } from '@/lib/project-context';
import { toast } from 'sonner';
import MemoryInspector from '@/components/memory/memory-inspector';

export default function MemoryPage() {
  const [currentSceneId, setCurrentSceneId] = useState<string | null>(null);
  const { projectId } = useProject();

  useEffect(() => {
    if (projectId) {
      fetchCurrentScene();
    }
  }, [projectId]);

  const fetchCurrentScene = async () => {
    try {
      const response = await fetch(`/api/workspace/scenes?projectId=${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch scenes');
      const scenes = await response.json();
      if (scenes.length > 0) {
        setCurrentSceneId(scenes[0].id);
      }
    } catch (error) {
      toast.error('Failed to load current scene');
    }
  };

  if (!currentSceneId) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-center text-muted-foreground">
          Create a scene to start tracking memory
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <MemoryInspector sceneId={currentSceneId} />
    </div>
  );
}