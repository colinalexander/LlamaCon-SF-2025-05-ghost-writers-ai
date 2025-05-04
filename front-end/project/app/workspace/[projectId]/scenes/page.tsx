'use client';

import { useEffect, useState } from 'react';
import { useProject } from '@/lib/project-context';
import { toast } from 'sonner';
import SceneCard from '@/components/scenes/scene-card';
import CreateSceneDialog from '@/components/scenes/create-scene-dialog';
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface Scene {
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
  scene_order: number;
}

export default function ScenesPage() {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(true);
  const { projectId } = useProject();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchScenes = async () => {
    try {
      const response = await fetch(`/api/workspace/scenes?projectId=${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch scenes');
      const data = await response.json();
      setScenes(data);
    } catch (error) {
      toast.error('Failed to load scenes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchScenes();
    }
  }, [projectId]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = scenes.findIndex((scene) => scene.id === active.id);
      const newIndex = scenes.findIndex((scene) => scene.id === over.id);

      const newScenes = arrayMove(scenes, oldIndex, newIndex).map((scene, index) => ({
        ...scene,
        scene_order: index + 1,
      }));

      setScenes(newScenes);

      try {
        const response = await fetch('/api/workspace/scenes/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scenes: newScenes.map(({ id, scene_order }) => ({ id, scene_order })),
            projectId,
          }),
        });

        if (!response.ok) throw new Error('Failed to reorder scenes');
      } catch (error) {
        toast.error('Failed to save scene order');
        fetchScenes(); // Revert to original order on error
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[200px] bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Scenes</h1>
        <CreateSceneDialog onSceneCreated={fetchScenes} />
      </div>

      {scenes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            No scenes yet. Create your first scene to get started!
          </p>
          <CreateSceneDialog onSceneCreated={fetchScenes} />
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={scenes.map((scene) => scene.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-6">
              {scenes.map((scene) => (
                <SceneCard
                  key={scene.id}
                  scene={scene}
                  onUpdate={fetchScenes}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}