'use client';

import { useEffect, useState } from 'react';
import { useProject } from '@/lib/project-context';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import MemoryInspector from '@/components/memory/memory-inspector';
import { ApiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function MemoryPage() {
  const [currentSceneId, setCurrentSceneId] = useState<string | null>(null);
  const { projectId } = useProject();
  const router = useRouter();
  
  const navigateToWorkspace = () => {
    if (projectId) {
      router.push(`/workspace/${projectId}`);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchCurrentScene();
    }
  }, [projectId]);

  const fetchCurrentScene = async () => {
    try {
      // Store projectId in localStorage for ApiClient to use
      if (projectId) {
        localStorage.setItem('currentProjectId', projectId);
      }
      
      const scenes = await ApiClient.get<any[]>(`/api/workspace/scenes?projectId=${projectId}`, {
        requiresProject: true
      });
      
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
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={navigateToWorkspace}
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Author's Workspace
          </Button>
        </div>
        <p className="text-center text-muted-foreground">
          Create a scene to start tracking memory
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={navigateToWorkspace}
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Author's Workspace
        </Button>
      </div>
      <MemoryInspector sceneId={currentSceneId} />
    </div>
  );
}
