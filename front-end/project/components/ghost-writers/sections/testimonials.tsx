"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Image from "next/image";

interface Testimonial {
  text: string;
  rating: number;
  author: string;
  position: string;
}

interface TestimonialsProps {
  testimonials: Testimonial[];
}

export default function Testimonials({ testimonials }: TestimonialsProps) {
  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
        />
      ));
  };

  const getAuthorImage = (author: string) => {
    return `/images/authors/${author.replace(/\s+/g, "-")}.png`;
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.5,
      },
    }),
  };

  return (
    <section className="py-24 bg-white dark:bg-gray-900">
      <div className="container px-4 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            From Our Writing Community
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            See what authors are saying about their experience with Ghost-Writers.AI
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={cardVariants}
              whileHover={{ scale: 1.03 }}
              className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl shadow-md relative"
            >
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-serif">
                "
              </div>
              <p className="text-gray-700 dark:text-gray-200 mb-6 pt-4 italic">
                {testimonial.text}
              </p>
              <div className="flex mb-4">{renderStars(testimonial.rating)}</div>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src={getAuthorImage(testimonial.author)}
                    alt={testimonial.author}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {testimonial.author}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {testimonial.position}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-xl text-gray-700 dark:text-gray-200 font-semibold mb-6">
            Ready to transform your writing process?
          </p>
          <button className="px-8 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors">
            Try Ghost-Writers.AI Today
          </button>
        </motion.div>
      </div>
    </section>
  );
}