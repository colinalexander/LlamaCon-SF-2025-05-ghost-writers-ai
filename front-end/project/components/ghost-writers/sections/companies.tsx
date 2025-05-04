"use client";

import React from "react";
import { motion } from "framer-motion";

interface Company {
  name: string;
  logo: string;
}

interface CompaniesProps {
  heading: string;
  companies: Company[];
}

export default function Companies({ heading, companies }: CompaniesProps) {
  // Placeholder logos for companies
  const companyLogos = [
    "https://images.pexels.com/photos/6170635/pexels-photo-6170635.jpeg?auto=compress&cs=tinysrgb&w=150",
    "https://images.pexels.com/photos/6170630/pexels-photo-6170630.jpeg?auto=compress&cs=tinysrgb&w=150",
    "https://images.pexels.com/photos/6170654/pexels-photo-6170654.jpeg?auto=compress&cs=tinysrgb&w=150",
    "https://images.pexels.com/photos/6170674/pexels-photo-6170674.jpeg?auto=compress&cs=tinysrgb&w=150",
  ];

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-800">
      <div className="container px-4 mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-3xl font-bold text-center mb-12"
        >
          {heading}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12"
        >
          {companies.map((company, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center bg-white dark:bg-gray-700 p-6 rounded-lg shadow-sm"
            >
              <div className="w-full h-20 mb-4 flex items-center justify-center">
                <img
                  src={company.logo || companyLogos[index % companyLogos.length]}
                  alt={company.name}
                  className="max-h-full max-w-full object-contain opacity-80 grayscale hover:grayscale-0 transition-all duration-300"
                />
              </div>
              <p className="font-medium text-gray-700 dark:text-gray-200 text-center">
                {company.name}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-600 dark:text-gray-300 italic max-w-xl mx-auto">
            "Join the growing community of authors who are revolutionizing their writing process with AI-assisted storytelling."
          </p>
        </motion.div>
      </div>
    </section>
  );
}