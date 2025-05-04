'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import AvatarDisplay from '@/components/tavus/avatar-display';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface StepThreeProps {
  genre: string;
}

export default function OnboardingStepThree({ genre }: StepThreeProps) {
  const [script, setScript] = useState<string>('');

  useEffect(() => {
    const generateScript = async () => {
      try {
        const response = await fetch('/api/tavus/script', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ genre }),
        });

        if (!response.ok) throw new Error('Failed to generate script');
        const data = await response.json();
        setScript(data.script);
      } catch (error) {
        toast.error('Failed to load writing coach');
      }
    };

    if (genre) {
      generateScript();
    }
  }, [genre]);

  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <h2 className="text-xl font-semibold mb-4">Meet Your Writing Coach</h2>
        
        <Card className="p-6">
          <AvatarDisplay genre={genre} script={script} />
        </Card>

        <div className="mt-8 p-6 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            Your AI writing coach will help you develop your story, maintain consistency,
            and overcome writer's block. They're available 24/7 to assist with
            brainstorming, character development, and scene planning.
          </p>
        </div>
      </motion.div>
    </div>
  );
}