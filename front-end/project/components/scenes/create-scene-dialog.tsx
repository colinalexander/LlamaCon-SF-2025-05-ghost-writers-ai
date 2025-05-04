'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import EditSceneForm from './edit-scene-form';
import { useProject } from '@/lib/project-context';
import { toast } from 'sonner';

interface CreateSceneDialogProps {
  onSceneCreated: () => void;
}

export default function CreateSceneDialog({ onSceneCreated }: CreateSceneDialogProps) {
  const [open, setOpen] = useState(false);
  const { projectId } = useProject();
  
  useEffect(() => {
    console.log('CreateSceneDialog - projectId from context:', projectId);
  }, [projectId]);
  
  const handleOpenChange = (newOpen: boolean) => {
    // Only allow opening if we have a project ID
    if (newOpen && !projectId) {
      toast.error('No active project. Please select a project first.');
      return;
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Scene
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Scene</DialogTitle>
        </DialogHeader>
        <EditSceneForm
          onSubmit={() => {
            setOpen(false);
            onSceneCreated();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}