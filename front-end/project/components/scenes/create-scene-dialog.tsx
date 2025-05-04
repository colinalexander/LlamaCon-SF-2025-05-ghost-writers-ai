'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import EditSceneForm from './edit-scene-form';

interface CreateSceneDialogProps {
  onSceneCreated: () => void;
}

export default function CreateSceneDialog({ onSceneCreated }: CreateSceneDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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