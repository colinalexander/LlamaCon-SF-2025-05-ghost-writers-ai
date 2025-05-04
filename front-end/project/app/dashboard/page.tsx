"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProjectCard from "@/components/projects/project-card";
import CreateProjectDialog from "@/components/projects/create-project-dialog";
import { toast } from "sonner";
import { useProject } from "@/lib/project-context";

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

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const data = await response.json();
      setProjects(data as Project[]);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

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
        <h1 className="text-3xl font-bold">My Projects</h1>
        <CreateProjectDialog onProjectCreated={fetchProjects} />
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