"use client";

import React from "react";
import { motion } from "framer-motion";
import { Pencil, Brain, BookOpen } from "lucide-react";

interface Feature {
  title: string;
  description: string;
}

interface FeaturesProps {
  features: Feature[];
}

export default function Features({ features }: FeaturesProps) {
  // Get appropriate icon for each feature
  const getFeatureIcon = (index: number) => {
    const icons = [
      <Pencil key={0} className="h-10 w-10 text-primary mb-4" />,
      <Brain key={1} className="h-10 w-10 text-primary mb-4" />,
      <BookOpen key={2} className="h-10 w-10 text-primary mb-4" />,
    ];
    return icons[index % icons.length];
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <section
      id="features"
      className="py-24 bg-white dark:bg-gray-900"
    >
      <div className="container px-4 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Storytelling Tools for Modern Authors
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Our AI-powered platform provides everything you need to craft compelling narratives with structure and continuity.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-10"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={item}
              whileHover={{ 
                y: -8,
                transition: { duration: 0.3 },
              }}
              className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center text-center"
            >
              {getFeatureIcon(index)}
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-20 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-10 rounded-2xl"
        >
          <div className="text-center max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">
              The Future of Storytelling
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Ghost-Writers.AI combines the creative human touch with powerful AI assistance to help you write better stories, faster.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10">
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold text-primary mb-2">30%</div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Faster writing process</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold text-primary mb-2">10x</div>
                <p className="text-sm text-gray-500 dark:text-gray-400">More consistent narratives</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Creative assistant access</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}