"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProjectCard from "@/components/projects/project-card";
import CreateProjectDialog from "@/components/projects/create-project-dialog";
import { toast } from "sonner";
import { useProject } from "@/lib/project-context";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  genre: string;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { setProjectId } = useProject();
  const { user, signOut } = useAuth();

  const fetchProjects = async () => {
    try {
      if (!user) {
        console.log('Dashboard: No user found, clearing projects');
        setProjects([]);
        setLoading(false);
        return;
      }
      
      console.log('Dashboard: Fetching projects for user ID:', user.id);
      const response = await fetch(`/api/projects?userId=${user.id}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Dashboard: Failed to fetch projects:', response.status, errorData);
        throw new Error(`Failed to fetch projects: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Dashboard: Fetched', data.length, 'projects for user');
      setProjects(data as Project[]);
    } catch (error) {
      console.error("Error fetching projects:", error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const handleEnterProject = (projectId: string) => {
    try {
      setProjectId(projectId);
      router.push(`/workspace/${projectId}`);
    } catch (error) {
      toast.error("Failed to enter project");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">My Projects</h1>
          {user && (
            <div className="flex items-center ml-4 text-sm text-muted-foreground">
              <User className="h-4 w-4 mr-1" />
              <span>{user.username}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-1" />
            Sign Out
          </Button>
          <CreateProjectDialog onProjectCreated={fetchProjects} />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[200px] bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No projects yet. Create your first project to get started!</p>
          <CreateProjectDialog onProjectCreated={fetchProjects} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              {...project}
              onEnter={handleEnterProject}
            />
          ))}
        </div>
      )}
    </div>
  );
}
