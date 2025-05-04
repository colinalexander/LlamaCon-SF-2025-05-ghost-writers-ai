'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProject } from '@/lib/project-context';

export default function ProjectPage({ params }: { params: { projectId: string } }) {
  const router = useRouter();
  const { projectId, setProjectId } = useProject();
  
  useEffect(() => {
    // Ensure project ID is set in context
    if (params.projectId && (!projectId || projectId !== params.projectId)) {
      setProjectId(params.projectId);
    }
    
    // Redirect to scenes page as the default landing page
    router.push(`/workspace/${params.projectId}/scenes`);
  }, [params.projectId, projectId, setProjectId, router]);

  // Return a loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}
