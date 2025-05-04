"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FaqProps {
  faqs: string[];
}

// Sample answers to pair with the FAQ questions
const faqAnswers = [
  "Ghost-Writers.AI is an innovative AI-powered storytelling platform designed specifically for fiction authors. It helps you plot, draft, and polish your manuscript with a focus on maintaining narrative continuity and character consistency across your entire story.",
  
  "Our platform uses a memory engine to maintain context across chapters, allowing for consistent character development and plotlines. It also provides organizational tools like character cards and scene templates to structure your long-form narrative.",
  
  "Absolutely! Ghost-Writers.AI is designed to be a collaborative tool, not a replacement for your creativity. You maintain full control over every word and can edit, accept, reject, or modify any AI-generated content to match your unique voice and vision.",
  
  "Yes! We offer a special free tier for hackathon participants and students. During LlamaCon 2025, we're providing extended trial access with all premium features enabled so you can experience the full platform.",
  
  "Yes, Ghost-Writers.AI supports all fiction genres including sci-fi, fantasy, thriller, mystery, romance, historical fiction, and more. The platform adapts to your specific genre needs with specialized research capabilities and trope awareness."
];

export default function Faq({ faqs }: FaqProps) {
  return (
    <section id="faq" className="py-24 bg-gray-50 dark:bg-gray-800">
      <div className="container px-4 mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Everything you need to know about Ghost-Writers.AI
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="space-y-4"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="border-b border-gray-200 dark:border-gray-700"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AccordionTrigger className="text-left font-medium py-4 hover:no-underline">
                    {faq}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 dark:text-gray-300 pb-4 pt-2">
                    {faqAnswers[index] || "Details coming soon."}
                  </AccordionContent>
                </motion.div>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-16 p-8 bg-white dark:bg-gray-700 rounded-xl shadow-md text-center"
        >
          <h3 className="text-xl font-semibold mb-4">Still have questions?</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Our team is here to help! Reach out any time and we'll get back to you as soon as possible.
          </p>
          <a
            href="/support"
            className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
          >
            Contact our support team →
          </a>
        </motion.div>
      </div>
    </section>
  );
}