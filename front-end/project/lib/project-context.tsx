'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';

interface ProjectContextType {
  projectId: string | null;
  setProjectId: (id: string | null) => void;
  clearProject: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projectId, setProjectId] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Restore project ID from localStorage or cookies on mount
    const storedProjectId = localStorage.getItem('currentProjectId');
    
    if (storedProjectId) {
      setProjectId(storedProjectId);
      // Ensure cookie is set (in case it was lost or expired)
      document.cookie = `currentProjectId=${storedProjectId}; path=/; max-age=2592000`; // 30 days
    } else {
      // Check if we have a cookie but no localStorage (rare edge case)
      const cookies = document.cookie.split('; ');
      const projectIdCookie = cookies.find(cookie => cookie.startsWith('currentProjectId='));
      
      if (projectIdCookie) {
        const cookieValue = projectIdCookie.split('=')[1];
        setProjectId(cookieValue);
        localStorage.setItem('currentProjectId', cookieValue);
      }
    }
  }, []);

  useEffect(() => {
    // Protect workspace routes
    if (pathname?.startsWith('/workspace') && !projectId) {
      toast.error('Please select a project first');
      router.push('/dashboard');
    }
  }, [pathname, projectId, router]);

  const handleSetProjectId = (id: string | null) => {
    setProjectId(id);
    console.log('Context: Setting project ID:', id);
    
    if (id) {
      // Set in both localStorage and cookie
      localStorage.setItem('currentProjectId', id);
      document.cookie = `currentProjectId=${id}; path=/; max-age=2592000`; // 30 days
      console.log('Context: Cookie set:', document.cookie);
    } else {
      // Remove from both localStorage and cookie
      localStorage.removeItem('currentProjectId');
      document.cookie = 'currentProjectId=; path=/; max-age=0'; // Delete cookie
      console.log('Context: Cookie removed:', document.cookie);
    }
  };

  const clearProject = () => {
    setProjectId(null);
    localStorage.removeItem('currentProjectId');
    document.cookie = 'currentProjectId=; path=/; max-age=0'; // Delete cookie
    router.push('/dashboard');
  };

  return (
    <ProjectContext.Provider 
      value={{ 
        projectId, 
        setProjectId: handleSetProjectId,
        clearProject 
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
