'use client';

import { useState } from 'react';
import { useProject } from '@/lib/project-context';
import { toast } from 'sonner';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Pencil, Trash2 } from 'lucide-react';
import EditCharacterForm from './edit-character-form';

interface CharacterCardProps {
  character: {
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
  };
  onUpdate: () => void;
}

export default function CharacterCard({ character, onUpdate }: CharacterCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { projectId } = useProject();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this character?')) return;

    try {
      const response = await fetch(
        `/api/workspace/characters/${character.id}?projectId=${projectId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Failed to delete character');

      toast.success('Character deleted');
      onUpdate();
    } catch (error) {
      toast.error('Failed to delete character');
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{character.name}</span>
          <div className="flex gap-2">
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Pencil className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Character</DialogTitle>
                </DialogHeader>
                <EditCharacterForm
                  character={character}
                  onSubmit={() => {
                    setIsEditing(false);
                    onUpdate();
                  }}
                />
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="icon" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
        {character.codename && (
          <p className="text-sm text-muted-foreground">
            aka {character.codename}
          </p>
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Role</h3>
            <p className="text-sm text-muted-foreground">{character.role}</p>
          </div>
          <div>
            <h3 className="font-semibold">Personality</h3>
            <p className="text-sm text-muted-foreground">
              {character.personality_traits}
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Current Status</h3>
            <p className="text-sm text-muted-foreground">{character.status}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={() => setIsEditing(true)}>
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}