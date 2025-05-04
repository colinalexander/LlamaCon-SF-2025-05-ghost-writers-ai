'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Edit2, Share2 } from 'lucide-react';

interface MemoryEntry {
  id: string;
  text: string;
  locked?: boolean;
}

interface MemorySectionProps {
  title: string;
  entries: MemoryEntry[];
  onEdit: (id: string) => void;
}

export default function MemorySection({ title, entries, onEdit }: MemorySectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">{title}</h4>
        <Button variant="ghost" size="sm">
          <Edit2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-2">
        {entries.map((entry) => (
          <Card key={entry.id} className="p-3">
            <div className="flex justify-between items-start gap-4">
              <p className="text-sm flex-1">{entry.text}</p>
              <div className="flex gap-2 flex-shrink-0">
                {entry.locked && <Lock className="h-4 w-4 text-muted-foreground" />}
                <Share2 className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" />
              </div>
            </div>
          </Card>
        ))}
        {entries.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-2">
            No {title.toLowerCase()} recorded
          </p>
        )}
      </div>
    </div>
  );
}