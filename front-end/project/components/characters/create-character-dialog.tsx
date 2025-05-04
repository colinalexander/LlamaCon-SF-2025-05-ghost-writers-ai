'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import EditCharacterForm from './edit-character-form';

interface CreateCharacterDialogProps {
  onCharacterCreated: () => void;
}

export default function CreateCharacterDialog({ onCharacterCreated }: CreateCharacterDialogProps) {
  const [open, setOpen] = useState(false);
  const [formRef, setFormRef] = useState<HTMLFormElement | null>(null);

  const handleSubmit = () => {
    if (formRef) {
      // Programmatically submit the form
      formRef.requestSubmit();
    }
  };

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
          formRef={setFormRef}
          onSubmit={() => {
            setOpen(false);
            onCharacterCreated();
          }}
        />
        <DialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit}>
            Create Character
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
