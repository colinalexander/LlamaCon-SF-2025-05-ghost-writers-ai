'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (username: string, email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load user from localStorage/cookie on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) throw new Error('Sign in failed');
      
      const userData = await response.json();
      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      document.cookie = `userId=${userData.id}; path=/; max-age=2592000`; // 30 days
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (username: string, email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      console.log('AuthContext: Signing up with:', { username, email, firstName, lastName, passwordLength: password?.length });
      
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, firstName, lastName }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Sign up failed with status:', response.status);
        console.error('Error details:', data);
        throw new Error(data.details || data.error || 'Sign up failed');
      }
      
      console.log('AuthContext: Sign up successful, user data:', data);
      
      setUser(data);
      localStorage.setItem('currentUser', JSON.stringify(data));
      document.cookie = `userId=${data.id}; path=/; max-age=2592000`; // 30 days
      
      console.log('AuthContext: User data stored, cookie set');
    } catch (error) {
      console.error('Sign up error:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw error;
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    document.cookie = 'userId=; path=/; max-age=0';
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
