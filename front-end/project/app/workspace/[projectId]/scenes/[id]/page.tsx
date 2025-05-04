'use client';

import { useState, useEffect } from 'react';
import { useProject } from '@/lib/project-context';
import { toast } from 'sonner';
import SceneEditor from '@/components/scenes/scene-editor';
import ResearchPanel from '@/components/research/research-panel';

interface Scene {
  id: string;
  title: string;
  content?: string;
}

interface Project {
  id: string;
  genre: string;
}

export default function ScenePage({ params }: { params: { id: string } }) {
  const [scene, setScene] = useState<Scene | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const { projectId } = useProject();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sceneRes, projectRes] = await Promise.all([
          fetch(`/api/workspace/scenes/${params.id}`),
          fetch(`/api/projects/${projectId}`),
        ]);

        if (!sceneRes.ok || !projectRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [sceneData, projectData] = await Promise.all([
          sceneRes.json(),
          projectRes.json(),
        ]);

        setScene(sceneData);
        setProject(projectData);
      } catch (error) {
        toast.error('Failed to load scene data');
      }
    };

    if (params.id && projectId) {
      fetchData();
    }
  }, [params.id, projectId]);

  if (!scene || !project) {
    return (
      <div className="container mx-auto p-6">
        <div className="h-[600px] bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SceneEditor
            sceneId={scene.id}
            initialContent={scene.content}
            onSave={async (content) => {
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

                if (!response.ok) throw new Error('Failed to save scene');
                toast.success('Scene saved successfully');
              } catch (error) {
                toast.error('Failed to save scene');
              }
            }}
          />
        </div>
        <div>
          <ResearchPanel
            sceneTitle={scene.title}
            genre={project.genre}
          />
        </div>
      </div>
    </div>
  );
}