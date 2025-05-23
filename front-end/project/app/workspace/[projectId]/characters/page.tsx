'use client';

import { useEffect, useState } from 'react';
import { useProject } from '@/lib/project-context';
import { toast } from 'sonner';
import CharacterCard from '@/components/characters/character-card';
import CreateCharacterDialog from '@/components/characters/create-character-dialog';
import ImportCharacterDialog from '@/components/characters/import-character-dialog';
import { Plus } from 'lucide-react';
import { BackButton } from '@/components/ui/back-button';
import { ApiClient } from '@/lib/api-client';

interface Character {
  id: string;
  name: string;
  codename_or_alias: string | null;
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

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const { projectId } = useProject();

  const fetchCharacters = async () => {
    try {
      // Store projectId in localStorage for ApiClient to use
      if (projectId) {
        localStorage.setItem('currentProjectId', projectId);
      }
      
      const data = await ApiClient.get<Character[]>(`/api/workspace/characters?projectId=${projectId}`, {
        requiresProject: true
      });
      
      setCharacters(data);
    } catch (error) {
      toast.error('Failed to load characters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchCharacters();
    }
  }, [projectId]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <BackButton projectId={projectId || undefined} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[400px] bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <BackButton projectId={projectId || undefined} />
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Characters</h1>
        <div className="flex gap-2">
          <ImportCharacterDialog onCharacterImported={fetchCharacters} />
          <CreateCharacterDialog onCharacterCreated={fetchCharacters} />
        </div>
      </div>

      {characters.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            No characters yet. Create your first character or import one to get started!
          </p>
          <div className="flex gap-2 justify-center">
            <ImportCharacterDialog onCharacterImported={fetchCharacters} />
            <CreateCharacterDialog onCharacterCreated={fetchCharacters} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              onUpdate={fetchCharacters}
            />
          ))}
        </div>
      )}
    </div>
  );
}
