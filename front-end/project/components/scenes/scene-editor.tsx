'use client';

import { useState, useEffect, useCallback } from 'react';
import { useProject } from '@/lib/project-context';
import { toast } from 'sonner';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import Document from '@tiptap/extension-document';
import DocumentHistory from '@tiptap/extension-history';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, Save, Undo, Redo, Keyboard, SparklesIcon } from 'lucide-react';
import SceneGenerationDialog from './scene-generation-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SceneEditorProps {
  sceneId: string;
  initialContent?: string;
  onSave: (content: string) => void;
}

export default function SceneEditor({ sceneId, initialContent, onSave }: SceneEditorProps) {
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<{ content: string; timestamp: Date }[]>([]);
  const { projectId } = useProject();
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  // Initialize Yjs document for collaboration
  const ydoc = new Y.Doc();
  const provider = new WebsocketProvider('ws://localhost:1234', `scene-${sceneId}`, ydoc);
  const ytext = ydoc.getText('content');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false,
      }),
      Highlight,
      Placeholder.configure({
        placeholder: 'Start writing your scene...',
      }),
      Document,
      DocumentHistory,
      Collaboration.configure({
        document: ydoc,
      }),
      CollaborationCursor.configure({
        provider,
      }),
    ],
    content: initialContent || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none max-w-none min-h-[500px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      if (autoSaveEnabled) {
        const debounceTimer = setTimeout(() => {
          handleSave(editor.getHTML());
        }, 2000);

        return () => clearTimeout(debounceTimer);
      }
    },
  });

  useEffect(() => {
    if (sceneId && projectId) {
      fetchHistory();
    }
  }, [sceneId, projectId]);

  // Effect to update editor content when initialContent or sceneId changes
  useEffect(() => {
    if (editor && (initialContent !== undefined)) {
      // Reset editor content when switching scenes
      editor.commands.setContent(initialContent || '');
    }
  }, [editor, initialContent, sceneId]);

  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (!editor) return;

      // Save: Cmd/Ctrl + S
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave(editor.getHTML());
      }

      // Undo: Cmd/Ctrl + Z
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        editor.chain().focus().undo().run();
      }

      // Redo: Cmd/Ctrl + Shift + Z
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        editor.chain().focus().redo().run();
      }

      // Bold: Cmd/Ctrl + B
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        editor.chain().focus().toggleBold().run();
      }

      // Italic: Cmd/Ctrl + I
      if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
        e.preventDefault();
        editor.chain().focus().toggleItalic().run();
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [editor]);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`/api/workspace/scenes/${sceneId}/history?projectId=${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch history');
      const data = await response.json();
      setHistory(data.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp),
      })));
    } catch (error) {
      toast.error('Failed to load scene history');
    }
  };

  const handleSave = async (content: string) => {
    if (!content.trim()) {
      toast.error('Cannot save empty content');
      return;
    }

    try {
      setSaving(true);
      await onSave(content);
      toast.success('Scene saved');
      fetchHistory();
    } catch (error) {
      toast.error('Failed to save scene');
    } finally {
      setSaving(false);
    }
  };

  const restoreVersion = useCallback((content: string) => {
    if (editor) {
      editor.commands.setContent(content);
      toast.success('Version restored');
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  const shortcuts = [
    { keys: ['⌘/Ctrl', 'S'], action: 'Save' },
    { keys: ['⌘/Ctrl', 'Z'], action: 'Undo' },
    { keys: ['⌘/Ctrl', 'Shift', 'Z'], action: 'Redo' },
    { keys: ['⌘/Ctrl', 'B'], action: 'Bold' },
    { keys: ['⌘/Ctrl', 'I'], action: 'Italic' },
  ];

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <Tabs defaultValue="editor" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => editor.chain().focus().undo().run()}
                      disabled={!editor.can().undo()}
                    >
                      <Undo className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Undo (⌘/Ctrl + Z)</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => editor.chain().focus().redo().run()}
                      disabled={!editor.can().redo()}
                    >
                      <Redo className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Redo (⌘/Ctrl + Shift + Z)</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
                    >
                      <Keyboard className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Keyboard Shortcuts</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="flex gap-2 items-center">
                {projectId && (
                  <SceneGenerationDialog 
                    sceneId={sceneId}
                    projectId={projectId}
                    onGeneratedContent={(content) => {
                    // Insert generated content into the editor
                    editor.commands.setContent(content);
                    toast.success('Content added to editor');
                  }}
                  />
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                >
                  {autoSaveEnabled ? 'Auto-save On' : 'Auto-save Off'}
                </Button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => handleSave(editor.getHTML())}
                      disabled={saving}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Save (⌘/Ctrl + S)</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {showKeyboardShortcuts && (
              <Card className="p-4 mb-4">
                <h3 className="font-semibold mb-2">Keyboard Shortcuts</h3>
                <div className="grid grid-cols-2 gap-2">
                  {shortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{shortcut.action}</span>
                      <div className="flex gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <kbd
                            key={keyIndex}
                            className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Card className="min-h-[600px] bg-card">
              <EditorContent editor={editor} />
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <History className="h-5 w-5" />
                <h3 className="font-semibold">Version History</h3>
              </div>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {history.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No history available</p>
                  ) : (
                    history.map((version, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {version.timestamp.toLocaleString()}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => restoreVersion(version.content)}
                          >
                            Restore
                          </Button>
                        </div>
                        <div
                          className="text-sm line-clamp-3"
                          dangerouslySetInnerHTML={{ __html: version.content }}
                        />
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}