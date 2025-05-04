'use client';

import { useState, useEffect } from 'react';
import { useProject } from '@/lib/project-context';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Loader2, RefreshCw, Save } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SceneGeneratorProps {
  sceneId: string;
  onSave: (content: string) => void;
}

export default function SceneGenerator({ sceneId, onSave }: SceneGeneratorProps) {
  const [wordTarget, setWordTarget] = useState(1000);
  const [generating, setGenerating] = useState(false);
  const [characters, setCharacters] = useState([]);
  const [memory, setMemory] = useState([]);
  const { projectId } = useProject();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Generated scene content will appear here...',
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none max-w-none min-h-[300px] p-4',
      },
    },
  });

  useEffect(() => {
    if (projectId && sceneId) {
      fetchContextData();
    }
  }, [projectId, sceneId]);

  const fetchContextData = async () => {
    try {
      const [charactersRes, memoryRes] = await Promise.all([
        fetch(`/api/workspace/characters?projectId=${projectId}`),
        fetch(`/api/workspace/scenes/${sceneId}/memory`),
      ]);

      if (charactersRes.ok) {
        const charactersData = await charactersRes.json();
        setCharacters(charactersData);
      }

      if (memoryRes.ok) {
        const memoryData = await memoryRes.json();
        setMemory(memoryData);
      }
    } catch (error) {
      toast.error('Failed to load context data');
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const response = await fetch(`/api/workspace/scenes/${sceneId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          wordTarget,
          projectId,
          context: {
            characters,
            memory,
          }
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate scene');
      }

      const { text } = await response.json();
      editor?.commands.setContent(text);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate scene');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = () => {
    if (editor) {
      const content = editor.getHTML();
      if (!content.trim()) {
        toast.error('Cannot save empty content');
        return;
      }
      onSave(content);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="generator" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generator">Generator</TabsTrigger>
          <TabsTrigger value="context">Scene Context</TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Target Word Count</Label>
              <span className="text-sm text-muted-foreground">
                {wordTarget.toLocaleString()} words
              </span>
            </div>
            <Slider
              value={[wordTarget]}
              onValueChange={(value) => setWordTarget(value[0])}
              min={500}
              max={5000}
              step={100}
              className="w-full"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full"
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate Scene
                </>
              )}
            </Button>
            <Button
              onClick={handleSave}
              variant="outline"
              disabled={!editor?.getText().trim().length}
            >
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>

          <Card className="min-h-[500px] bg-card">
            <EditorContent editor={editor} />
          </Card>
        </TabsContent>

        <TabsContent value="context" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Characters Present</h3>
              <div className="space-y-2">
                {characters.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No characters found</p>
                ) : (
                  characters.map((char: any) => (
                    <div key={char.id} className="text-sm">
                      <span className="font-medium">{char.name}</span>
                      {char.role && (
                        <span className="text-muted-foreground"> - {char.role}</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-2">Scene Memory</h3>
              <div className="space-y-2">
                {memory.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No memory entries found</p>
                ) : (
                  memory.map((item: any) => (
                    <div key={item.id} className="text-sm">
                      <span className="text-muted-foreground">{item.text}</span>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}