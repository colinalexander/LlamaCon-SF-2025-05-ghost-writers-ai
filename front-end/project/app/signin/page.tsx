'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function SignInPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'signin' | 'create'>('signin');
  const [error, setError] = useState<string | null>(null);
  const [emailInUse, setEmailInUse] = useState(false);
  const router = useRouter();
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setEmailInUse(false);
    
    try {
      if (mode === 'signin') {
        await signIn(email, password);
        toast.success('Signed in successfully!');
        router.push('/dashboard');
      } else {
        console.log('SignInPage: Creating account with:', { username, email, passwordLength: password?.length });
        await signUp(username, email, password);
        toast.success('Account created successfully!');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('SignInPage error:', error);
      
      // Check if it's an "email already in use" error
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('Email already in use')) {
        setEmailInUse(true);
        setError('This email is already registered. You can sign in instead.');
      } else {
        // Display more detailed error message
        let displayError = mode === 'signin' ? 'Failed to sign in' : 'Failed to create account';
        
        if (error instanceof Error) {
          displayError += `: ${error.message}`;
        }
        
        setError(displayError);
        toast.error(displayError);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const switchToSignIn = () => {
    setMode('signin');
    setError(null);
    setEmailInUse(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Tabs defaultValue={mode} onValueChange={(value) => setMode(value as 'signin' | 'create')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="create">Create Account</TabsTrigger>
            </TabsList>
          </Tabs>
          <CardTitle className="text-2xl mt-4">
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </CardTitle>
          <CardDescription>
            {mode === 'signin' 
              ? 'Enter your details to access Ghost-Writers.AI' 
              : 'Create a new account to get started with Ghost-Writers.AI'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {mode === 'create' && (
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required={mode === 'create'}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col space-y-4">
            {error && (
              <Alert variant={emailInUse ? "default" : "destructive"} className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{emailInUse ? "Account Exists" : "Error"}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
                {emailInUse && (
                  <Button 
                    variant="outline" 
                    className="mt-2 w-full"
                    onClick={switchToSignIn}
                  >
                    Switch to Sign In
                  </Button>
                )}
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading 
                ? (mode === 'signin' ? 'Signing in...' : 'Creating account...') 
                : (mode === 'signin' ? 'Sign In' : 'Create Account')}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
