'use client';

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface HeroProps {
  heading: string;
  subheading: string;
  keyBenefits: string[];
  ctaText: string;
  abTest?: {
    enabled: boolean;
    variants: {
      A: { heroHeading: string; ctaText: string };
      B: { heroHeading: string; ctaText: string };
    };
    currentVariant: string;
  };
}

export default function Hero({
  heading,
  subheading,
  keyBenefits,
  ctaText,
  abTest,
}: HeroProps) {
  const [variant, setVariant] = useState(abTest?.currentVariant || "A");
  const router = useRouter();
  
  useEffect(() => {
    if (abTest?.enabled) {
      const variants = ["A", "B"];
      const randomVariant = variants[Math.floor(Math.random() * 2)];
      setVariant(randomVariant);
    }
  }, [abTest?.enabled]);

  const displayHeading = abTest?.enabled
    ? abTest.variants[variant as "A" | "B"].heroHeading
    : heading;
    
  const displayCtaText = abTest?.enabled
    ? abTest.variants[variant as "A" | "B"].ctaText
    : ctaText;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const handleStartWriting = () => {
    router.push('/signin');
  };

  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>
      
      <div className="container relative z-10 px-4 mx-auto max-w-7xl">
        <motion.div 
          className="flex flex-col items-center text-center"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 max-w-4xl mx-auto leading-tight pb-2"
            variants={item}
          >
            {displayHeading}
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto"
            variants={item}
          >
            {subheading}
          </motion.p>
          
          <motion.div 
            className="flex flex-col items-center mb-12"
            variants={container}
          >
            {keyBenefits.map((benefit, index) => (
              <motion.div 
                key={index} 
                className="flex items-center mb-3"
                variants={item}
                whileHover={{ scale: 1.03 }}
              >
                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-200">{benefit}</span>
              </motion.div>
            ))}
          </motion.div>
          
          <motion.div 
            variants={item}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={handleStartWriting}
            >
              {displayCtaText}
            </Button>
          </motion.div>
          
          <motion.div 
            className="mt-16 relative w-full max-w-5xl mx-auto rounded-lg overflow-hidden shadow-2xl"
            variants={item}
          >
            <Image 
              src="/images/Ghost-Writers-Logo.png"
              alt="Ghost-Writers.AI Platform Interface" 
              width={1200}
              height={675}
              className="w-full h-auto object-cover rounded-lg border border-gray-200 dark:border-gray-700"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
