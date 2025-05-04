'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProject } from '@/lib/project-context';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import OnboardingStepOne from '@/components/onboarding/step-one';
import OnboardingStepTwo from '@/components/onboarding/step-two';
import OnboardingStepThree from '@/components/onboarding/step-three';

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1
    genre: '',
    audience: '',
    style: '',
    storyLength: '',
    // Step 2
    title: '',
    description: '',
    tone: '',
    // Step 3 is just display
  });
  const router = useRouter();
  const { setProjectId } = useProject();

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      const data = await response.json();
      setProjectId(data.id);
      toast.success('Project created successfully!');
      router.push(`/workspace/${data.id}`);
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  const updateFormData = (newData: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-card rounded-xl shadow-lg p-6 md:p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Create Your Story</h1>
            <div className="text-sm text-muted-foreground">
              Step {step} of 3
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {step === 1 && (
                <OnboardingStepOne
                  data={formData}
                  updateData={updateFormData}
                />
              )}
              {step === 2 && (
                <OnboardingStepTwo
                  data={formData}
                  updateData={updateFormData}
                />
              )}
              {step === 3 && (
                <OnboardingStepThree
                  genre={formData.genre}
                />
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
            >
              Back
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            {step < 3 ? (
              <Button onClick={handleNext}>Next</Button>
            ) : (
              <Button onClick={handleSubmit}>Start Writing</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}