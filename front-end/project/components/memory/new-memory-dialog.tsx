'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface NewMemoryDialogProps {
  onSubmit: (entry: { text: string; category: string }) => void;
  onCancel: () => void;
}

export default function NewMemoryDialog({ onSubmit, onCancel }: NewMemoryDialogProps) {
  const [text, setText] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text || !category) return;
    onSubmit({ text, category });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="characters">Characters</SelectItem>
            <SelectItem value="world">World Facts</SelectItem>
            <SelectItem value="plot">Plot Points</SelectItem>
            <SelectItem value="style">Style Notes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="text">Memory Entry</Label>
        <Textarea
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter memory details..."
          rows={4}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!text || !category}>
          Add Entry
        </Button>
      </div>
    </form>
  );
}