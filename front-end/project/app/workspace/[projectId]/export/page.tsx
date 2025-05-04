'use client';

import { useState, useEffect } from 'react';
import { useProject } from '@/lib/project-context';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Download } from 'lucide-react';
import ExportPreview from '@/components/export/export-preview';

export default function ExportPage() {
  const [exportData, setExportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { projectId } = useProject();

  const fetchExportData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/workspace/export?projectId=${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch export data');
      const data = await response.json();
      setExportData(data);
    } catch (error) {
      toast.error('Failed to load export data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchExportData();
    }
  }, [projectId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
      toast.success('Export data copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy export data');
    }
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'story-export.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to download export data');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="h-[600px] bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Story Export</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCopy}>
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="preview">Formatted Preview</TabsTrigger>
            <TabsTrigger value="raw">Raw JSON</TabsTrigger>
          </TabsList>

          <TabsContent value="preview">
            <ScrollArea className="h-[600px]">
              <ExportPreview data={exportData} />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="raw">
            <ScrollArea className="h-[600px]">
              <pre className="text-sm font-mono whitespace-pre-wrap">
                {JSON.stringify(exportData, null, 2)}
              </pre>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}