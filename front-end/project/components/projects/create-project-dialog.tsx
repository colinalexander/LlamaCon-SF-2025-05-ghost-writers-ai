'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CreateProjectDialogProps {
  onProjectCreated: () => void;
}

export default function CreateProjectDialog({ onProjectCreated }: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleCreateProject = () => {
    setOpen(false);
    router.push('/onboarding');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-center">
          <p className="text-muted-foreground">
            Let's set up your new writing project! Our wizard will guide you through:
          </p>
          <ul className="text-left space-y-2">
            <li>• Defining your story's genre and style</li>
            <li>• Creating a compelling summary</li>
            <li>• Meeting your AI writing coach</li>
          </ul>
          <Button onClick={handleCreateProject} className="w-full mt-4">
            Start Project Setup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}