'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  projectId?: string;
  label?: string;
  className?: string;
}

/**
 * A reusable back button component that navigates to the author's workspace
 * 
 * @param projectId - The ID of the current project
 * @param label - The button label (defaults to "Back to Author's Workspace")
 * @param className - Additional CSS classes to apply to the button container
 */
export function BackButton({ 
  projectId, 
  label = "Back to Author's Workspace",
  className = "mb-6"
}: BackButtonProps) {
  const router = useRouter();
  
  const navigateToWorkspace = () => {
    if (projectId) {
      router.push(`/workspace/${projectId}`);
    }
  };

  return (
    <div className={className}>
      <Button 
        variant="outline" 
        onClick={navigateToWorkspace}
        className="flex items-center"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {label}
      </Button>
    </div>
  );
}
