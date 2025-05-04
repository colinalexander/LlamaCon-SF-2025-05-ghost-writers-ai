'use client';

import { useState, useEffect } from 'react';
import { useProject } from '@/lib/project-context';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface EditSceneFormProps {
  scene?: {
    id: string;
    title: string;
    location: string;
    time: string;
    conflict: string;
    characters_present: string;
    character_changes: string;
    important_actions: string;
    mood: string;
    summary: string;
  };
  onSubmit: () => void;
}

export default function EditSceneForm({ scene, onSubmit }: EditSceneFormProps) {
  const { projectId } = useProject();
  const [loading, setLoading] = useState(false);
  
  // Debug projectId on component mount
  useEffect(() => {
    console.log('EditSceneForm - projectId from context:', projectId);
  }, [projectId]);

  const [formData, setFormData] = useState({
    title: scene?.title || '',
    location: scene?.location || '',
    time: scene?.time || '',
    conflict: scene?.conflict || '',
    charactersPresent: scene?.characters_present || '',
    characterChanges: scene?.character_changes || '',
    importantActions: scene?.important_actions || '',
    mood: scene?.mood || '',
    summary: scene?.summary || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Debug projectId
    console.log('Submitting scene with projectId:', projectId);
    
    if (!projectId) {
      toast.error('Project ID is missing. Please try again or reload the page.');
      setLoading(false);
      return;
    }

    try {
      const url = scene
        ? `/api/workspace/scenes/${scene.id}`
        : '/api/workspace/scenes';
      
      const method = scene ? 'PUT' : 'POST';

      // Include explicit project ID debugging
      console.log('Making fetch request to:', url);
      console.log('Request payload:', { ...formData, projectId });
      
      // TypeScript safety check - ensure projectId is a string (should be caught by earlier check too)
      if (!projectId) {
        throw new Error('Project ID is required');
      }
      
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'x-project-id': projectId
        },
        body: JSON.stringify({ ...formData, projectId })
      });

      if (!response.ok) throw new Error('Failed to save scene');

      toast.success(
        scene ? 'Scene updated successfully' : 'Scene created successfully'
      );
      onSubmit();
    } catch (error) {
      toast.error(
        scene ? 'Failed to update scene' : 'Failed to create scene'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Scene Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Give your scene a descriptive title"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Where does the scene take place?"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="time">Time</Label>
          <Input
            id="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            placeholder="When does the scene occur?"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="conflict">Main Conflict or Purpose</Label>
        <Textarea
          id="conflict"
          value={formData.conflict}
          onChange={(e) => setFormData({ ...formData, conflict: e.target.value })}
          placeholder="What is the main tension or purpose of this scene?"
          rows={2}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="charactersPresent">Characters Present</Label>
        <Textarea
          id="charactersPresent"
          value={formData.charactersPresent}
          onChange={(e) => setFormData({ ...formData, charactersPresent: e.target.value })}
          placeholder="List all characters who appear in this scene"
          rows={2}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="characterChanges">Character Changes</Label>
        <Textarea
          id="characterChanges"
          value={formData.characterChanges}
          onChange={(e) => setFormData({ ...formData, characterChanges: e.target.value })}
          placeholder="Note any character developments or changes"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="importantActions">Important Actions or Decisions</Label>
        <Textarea
          id="importantActions"
          value={formData.importantActions}
          onChange={(e) => setFormData({ ...formData, importantActions: e.target.value })}
          placeholder="What key events or decisions occur?"
          rows={2}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="mood">Mood / Atmosphere</Label>
        <Input
          id="mood"
          value={formData.mood}
          onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
          placeholder="What's the overall feeling of the scene?"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="summary">Scene Summary</Label>
        <Textarea
          id="summary"
          value={formData.summary}
          onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
          placeholder="Write a brief summary of the scene's key moments"
          rows={3}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Saving...' : scene ? 'Update Scene' : 'Create Scene'}
      </Button>
    </form>
  );
}