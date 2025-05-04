'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ExportPreviewProps {
  data: {
    project: {
      title: string;
      description: string;
      genre: string;
      audience: string;
      style: string;
    };
    characters: Array<{
      name: string;
      role: string;
      background: string;
      personality_traits: string;
      status: string;
    }>;
    scenes: Array<{
      title: string;
      summary: string;
      characters_present: string;
      memory: Array<{
        category: string;
        text: string;
      }>;
    }>;
    memory: {
      characters: string[];
      world: string[];
      plot: string[];
      style: string[];
    };
  };
}

export default function ExportPreview({ data }: ExportPreviewProps) {
  if (!data) return null;

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Project Overview</h2>
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-2">{data.project.title}</h3>
          <p className="text-muted-foreground mb-4">{data.project.description}</p>
          <div className="flex gap-2">
            <Badge>{data.project.genre}</Badge>
            <Badge variant="outline">{data.project.audience}</Badge>
            <Badge variant="outline">{data.project.style}</Badge>
          </div>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Characters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.characters.map((character, index) => (
            <Card key={index} className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{character.name}</h3>
                <Badge>{character.role}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{character.background}</p>
              <p className="text-sm">
                <span className="font-medium">Personality: </span>
                {character.personality_traits}
              </p>
              <p className="text-sm mt-2">
                <span className="font-medium">Current Status: </span>
                {character.status}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Recent Scenes</h2>
        <div className="space-y-4">
          {data.scenes.map((scene, index) => (
            <Card key={index} className="p-6">
              <h3 className="text-lg font-semibold mb-2">{scene.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{scene.summary}</p>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Characters Present: </span>
                  {scene.characters_present}
                </p>
                {scene.memory && scene.memory.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Scene Memory</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {scene.memory.map((item, mIndex) => (
                        <div key={mIndex} className="text-sm">
                          <Badge variant="outline" className="mb-1">
                            {item.category}
                          </Badge>
                          <p className="text-muted-foreground">{item.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Story Memory</h2>
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Character Memory</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {data.memory.characters.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">World Building</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {data.memory.world.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Plot Points</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {data.memory.plot.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Style Notes</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {data.memory.style.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}