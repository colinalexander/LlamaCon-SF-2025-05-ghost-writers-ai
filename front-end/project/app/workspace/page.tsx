'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProject } from '@/lib/project-context';

export default function WorkspaceRedirectPage() {
  const { projectId } = useProject();
  const router = useRouter();

  useEffect(() => {
    if (projectId) {
      // Redirect to the project workspace
      router.push(`/workspace/${projectId}`);
    } else {
      // If no project ID, redirect to dashboard
      router.push('/dashboard');
    }
  }, [projectId, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting...</h1>
        <p className="text-muted-foreground">Please wait while we redirect you to your workspace.</p>
      </div>
    </div>
  );
}
