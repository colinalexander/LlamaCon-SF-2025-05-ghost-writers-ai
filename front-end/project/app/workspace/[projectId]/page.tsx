'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useProject } from '@/lib/project-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Brain, FileText, Video, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Project {
  id: string;
  title?: string;
  description?: string;
  genre?: string;
}

export default function WorkspacePage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const router = useRouter();
  const { setProjectId } = useProject();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch project details
  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) {
        setLoading(false);
        setError('No project ID found');
        return;
      }

      console.log('Workspace: Fetching project details for ID:', projectId);
      
      try {
        setProjectId(projectId);
        
        try {
          console.log('Workspace: Making API request to:', `/api/projects/${projectId}`);
          const response = await fetch(`/api/projects/${projectId}`);
          console.log('Workspace: API response status:', response.status);
          
          if (!response.ok) {
            // If we can't fetch the project details, just use the ID
            console.log('API returned error, using default project with ID only');
            setProject({ id: projectId });
            setError(`Could not load full project details (${response.status})`);
          } else {
            const data = await response.json();
            console.log('Workspace: Project data received:', data);
            
            if (!data || !data.id) {
              console.error('Invalid project data received:', data);
              setError('Invalid project data received');
              // Continue with default values
              setProject({ id: projectId });
            } else {
              setProject(data);
            }
          }
        } catch (error) {
          console.error('Error fetching project:', error);
          setError('Failed to load project details');
          // Continue with default values
          setProject({ id: projectId });
        } finally {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error setting project ID:', error);
        setError('Failed to set project context');
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, setProjectId]);

  const navigateTo = (path: string) => {
    router.push(`/workspace/${projectId}/${path}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="h-[200px] bg-muted animate-pulse rounded-lg mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-[200px] bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}. You can still navigate to the workspace sections below.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{project?.title || 'Your Workspace'}</h1>
        {project?.description && (
          <p className="text-muted-foreground mt-2">{project.description}</p>
        )}
        {project?.genre && (
          <div className="flex items-center mt-2">
            <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
              {project.genre}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              Scenes
            </CardTitle>
            <CardDescription>
              Create and manage your story scenes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Organize your story with a timeline of scenes. Add details like setting, mood, and characters present.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigateTo('scenes')} className="w-full">
              Go to Scenes
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Characters
            </CardTitle>
            <CardDescription>
              Develop your story characters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Create detailed character profiles with traits, motivations, and relationships.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigateTo('characters')} className="w-full">
              Go to Characters
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="mr-2 h-5 w-5" />
              Memory
            </CardTitle>
            <CardDescription>
              Track important story elements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Keep track of world facts, plot points, and style notes for your story.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigateTo('memory')} className="w-full">
              Go to Memory
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Video className="mr-2 h-5 w-5" />
              Writing Coach
            </CardTitle>
            <CardDescription>
              Get personalized writing advice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Interact with your AI writing coach for guidance on character development, plot structure, and more.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigateTo('coach')} className="w-full">
              Talk to Coach
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Export
            </CardTitle>
            <CardDescription>
              Export your story
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Export your story in various formats for sharing or publishing.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigateTo('export')} className="w-full">
              Go to Export
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
