'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Import } from 'lucide-react';
import { useProject } from '@/lib/project-context';
import { toast } from 'sonner';

interface Character {
  id: string;
  name: string;
  codename: string | null;
  role: string;
  background: string;
  personality_traits: string;
  skills: string;
  wants: string;
  fears: string;
  appearance: string;
  status: string;
  notes: string | null;
}

interface ImportCharacterDialogProps {
  onCharacterImported: () => void;
}

export default function ImportCharacterDialog({ onCharacterImported }: ImportCharacterDialogProps) {
  const [open, setOpen] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(false);
  const { projectId } = useProject();

  const fetchSharedCharacters = async () => {
    try {
      const response = await fetch('/api/workspace/characters/shared');
      if (!response.ok) throw new Error('Failed to fetch shared characters');
      const data = await response.json();
      setCharacters(data);
    } catch (error) {
      toast.error('Failed to load shared characters');
    }
  };

  const handleImport = async (character: Character) => {
    try {
      setLoading(true);
      const response = await fetch('/api/workspace/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...character,
          projectId,
        }),
      });

      if (!response.ok) throw new Error('Failed to import character');

      toast.success('Character imported successfully');
      onCharacterImported();
      setOpen(false);
    } catch (error) {
      toast.error('Failed to import character');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (isOpen) fetchSharedCharacters();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Import className="h-4 w-4 mr-2" />
          Import Character
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Shared Characters</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {characters.map((character) => (
            <div
              key={character.id}
              className="p-4 border rounded-lg hover:border-primary transition-colors"
            >
              <h3 className="font-semibold mb-2">{character.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{character.role}</p>
              <Button
                onClick={() => handleImport(character)}
                disabled={loading}
                className="w-full"
              >
                Import
              </Button>
            </div>
          ))}
          
          {characters.length === 0 && (
            <div className="col-span-2 text-center py-8 text-muted-foreground">
              No shared characters available
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}