'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import EditCharacterForm from './edit-character-form';

interface CreateCharacterDialogProps {
  onCharacterCreated: () => void;
}

export default function CreateCharacterDialog({ onCharacterCreated }: CreateCharacterDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Character
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Character</DialogTitle>
        </DialogHeader>
        <EditCharacterForm
          onSubmit={() => {
            setOpen(false);
            onCharacterCreated();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}