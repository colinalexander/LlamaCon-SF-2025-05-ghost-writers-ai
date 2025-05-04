'use client';

import { useState, useRef, useEffect, Dispatch, SetStateAction } from 'react';
import { useProject } from '@/lib/project-context';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ApiClient } from '@/lib/api-client';

interface EditCharacterFormProps {
  character?: {
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
  };
  onSubmit: () => void;
  formRef?: Dispatch<SetStateAction<HTMLFormElement | null>>;
}

export default function EditCharacterForm({ character, onSubmit, formRef }: EditCharacterFormProps) {
  const { projectId } = useProject();
  const [loading, setLoading] = useState(false);
  const formElement = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState({
    name: character?.name || '',
    codename_or_alias: character?.codename_or_alias || '',
    role: character?.role || '',
    background: character?.background || '',
    personalityTraits: character?.personality_traits || '',
    skills: character?.skills || '',
    wants: character?.wants || '',
    fears: character?.fears || '',
    appearance: character?.appearance || '',
    status: character?.status || '',
    notes: character?.notes || ''
  });

  // Set the form reference for the parent component if needed
  useEffect(() => {
    if (formRef && formElement.current) {
      formRef(formElement.current);
    }
  }, [formRef]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Store projectId in localStorage for ApiClient to use
      if (projectId) {
        localStorage.setItem('currentProjectId', projectId);
      }
      
      if (character) {
        // Update existing character
        await ApiClient.put(`/api/workspace/characters/${character.id}`, 
          { ...formData, projectId },
          { requiresProject: true }
        );
      } else {
        // Create new character
        await ApiClient.post('/api/workspace/characters', 
          { ...formData, projectId },
          { requiresProject: true }
        );
      }

      toast.success(
        character ? 'Character updated successfully' : 'Character created successfully'
      );
      onSubmit();
    } catch (error) {
      console.error('Character save error:', error);
      toast.error(
        character ? 'Failed to update character' : 'Failed to create character'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form ref={formElement} onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Character's full name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="codename_or_alias">Codename or Alias (Optional)</Label>
          <Input
            id="codename_or_alias"
            value={formData.codename_or_alias}
            onChange={(e) => setFormData({ ...formData, codename_or_alias: e.target.value })}
            placeholder="Alias or nickname"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role in Story</Label>
        <Select
          value={formData.role}
          onValueChange={(value) => setFormData({ ...formData, role: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="protagonist">Protagonist</SelectItem>
            <SelectItem value="antagonist">Antagonist</SelectItem>
            <SelectItem value="mentor">Mentor</SelectItem>
            <SelectItem value="ally">Ally</SelectItem>
            <SelectItem value="love-interest">Love Interest</SelectItem>
            <SelectItem value="rival">Rival</SelectItem>
            <SelectItem value="supporting">Supporting Character</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="background">Background</Label>
        <Textarea
          id="background"
          value={formData.background}
          onChange={(e) => setFormData({ ...formData, background: e.target.value })}
          placeholder="Character's history and origins"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="personalityTraits">Personality Traits</Label>
        <Textarea
          id="personalityTraits"
          value={formData.personalityTraits}
          onChange={(e) => setFormData({ ...formData, personalityTraits: e.target.value })}
          placeholder="Key personality traits (3-5)"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="skills">Skills & Strengths</Label>
        <Textarea
          id="skills"
          value={formData.skills}
          onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
          placeholder="Notable abilities and expertise"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="wants">Wants</Label>
          <Textarea
            id="wants"
            value={formData.wants}
            onChange={(e) => setFormData({ ...formData, wants: e.target.value })}
            placeholder="Character's desires and goals"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fears">Fears</Label>
          <Textarea
            id="fears"
            value={formData.fears}
            onChange={(e) => setFormData({ ...formData, fears: e.target.value })}
            placeholder="Character's fears and weaknesses"
            rows={2}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="appearance">Signature Look</Label>
        <Textarea
          id="appearance"
          value={formData.appearance}
          onChange={(e) => setFormData({ ...formData, appearance: e.target.value })}
          placeholder="Distinctive visual characteristics"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Starting Status</Label>
        <Input
          id="status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          placeholder="Current situation in the story"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Other important details, secrets, or future developments"
          rows={3}
        />
      </div>

      {/* Only show the submit button when not used in a dialog with external buttons */}
      {!formRef && (
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Saving...' : character ? 'Update Character' : 'Create Character'}
        </Button>
      )}
    </form>
  );
}
