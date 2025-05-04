'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import WritingCoachConversation from '@/components/tavus/writing-coach-conversation';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { BookInfo } from '@/lib/tavus-prompts';

interface StepThreeProps {
  genre: string;
  bookInfo?: BookInfo;
}

export default function OnboardingStepThree({ genre, bookInfo }: StepThreeProps) {
  const [script, setScript] = useState<string>('');
  const [componentId] = useState(() => Math.random().toString(36).substring(2, 8));

  // Debug: Log component lifecycle
  useEffect(() => {
    console.log(`OnboardingStepThree (${componentId}): Component mounted with genre:`, genre);
    
    return () => {
      console.log(`OnboardingStepThree (${componentId}): Component unmounted`);
    };
  }, [componentId, genre]);

  useEffect(() => {
    console.log(`OnboardingStepThree (${componentId}): Generating script for genre:`, genre);
    
    const generateScript = async () => {
      try {
        const response = await fetch('/api/tavus/script', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ genre }),
        });

        if (!response.ok) throw new Error('Failed to generate script');
        const data = await response.json();
        console.log(`OnboardingStepThree (${componentId}): Script generated successfully`);
        setScript(data.script);
      } catch (error) {
        console.error(`OnboardingStepThree (${componentId}): Error generating script:`, error);
        toast.error('Failed to load writing coach');
      }
    };

    if (genre) {
      generateScript();
    }
  }, [genre, componentId]);

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
          <WritingCoachConversation genre={genre} bookInfo={bookInfo} />
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
