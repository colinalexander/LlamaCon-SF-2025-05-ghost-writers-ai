'use client';

import { useProject } from "@/lib/project-context";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { projectId } = useProject();
  const router = useRouter();

  useEffect(() => {
    if (!projectId) {
      toast.error("Please select a project first");
      router.push("/dashboard");
    }
  }, [projectId, router]);

  if (!projectId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}