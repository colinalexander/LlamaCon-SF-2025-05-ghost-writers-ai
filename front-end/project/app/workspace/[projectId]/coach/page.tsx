'use client';

import { useEffect, useState } from 'react';
import { useProject } from '@/lib/project-context';
import { toast } from 'sonner';
import AvatarDisplay from '@/components/tavus/avatar-display';

export default function CoachPage() {
  const [projectData, setProjectData] = useState<{ genre: string } | null>(null);
  const [script, setScript] = useState<string>('');
  const { projectId } = useProject();

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) throw new Error('Failed to fetch project');
        const data = await response.json();
        setProjectData(data);

        // Generate script based on project genre
        const scriptResponse = await fetch('/api/tavus/script', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ genre: data.genre }),
        });

        if (!scriptResponse.ok) throw new Error('Failed to generate script');
        const scriptData = await scriptResponse.json();
        setScript(scriptData.script);
      } catch (error) {
        toast.error('Failed to load writing coach');
      }
    };

    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  if (!projectData) {
    return (
      <div className="container mx-auto p-6">
        <div className="h-[400px] bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Writing Coach</h1>
      <div className="max-w-3xl mx-auto">
        <AvatarDisplay genre={projectData.genre} script={script} />
      </div>
    </div>
  );
}