"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book } from "lucide-react";
import { toast } from "sonner";

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  genre: string;
  onEnter: (id: string) => void;
}

export default function ProjectCard({ id, title, description, genre, onEnter }: ProjectCardProps) {
  const handleEnterProject = () => {
    try {
      onEnter(id);
    } catch (error) {
      toast.error("Failed to enter project");
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Book className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground mb-2">{description}</p>
        <div className="inline-block bg-secondary px-2 py-1 rounded-md text-xs font-medium">
          {genre}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleEnterProject}
        >
          Enter Project
        </Button>
      </CardFooter>
    </Card>
  );
}