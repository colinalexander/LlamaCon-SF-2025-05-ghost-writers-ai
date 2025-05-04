'use client';

import React, { useEffect, useState } from "react";
import Header from "./sections/header";
import Hero from "./sections/hero";
import Features from "./sections/features";
import Companies from "./sections/companies";
import Testimonials from "./sections/testimonials";
import Faq from "./sections/faq";
import Footer from "./sections/footer";
import SchemaMarkup from "./schema-markup";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";

export default function GhostWritersWebsite() {
  // Add state to handle client-side mounting
  const [mounted, setMounted] = useState(false);

  // Only show the UI after first client-side render to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="light"
      enableSystem={true}
      disableTransitionOnChange
    >
      <main className="flex flex-col min-h-screen">
        <SchemaMarkup 
          name="Ghost-Writers.AI"
          url="https://www.ghost-writers.ai"
          logo="https://www.ghost-writers.ai/logo.png"
        />
        <Header 
          promoBanner={{
            enabled: true,
            text: "🚀 Built at LlamaCon 2025 — Try Ghost-Writers.AI free today!",
            link: "https://www.ghost-writers.ai",
            backgroundColor: "bg-[#0C0C0D]",
            textColor: "text-white",
          }}
          menuItems={["Features", "How It Works", "Demo", "Blog", "Contact"]}
          logo=""
        />
        <Hero 
          heading="Bring Your Story to Life with Ghost-Writers.AI"
          subheading="An AI-powered storytelling platform that helps you plot, draft, and polish your next novel — with memory, structure, and creativity."
          keyBenefits={[
            "Generate chapters in seconds with AI agents",
            "Maintain memory across scenes",
            "Research deep topics like a spy novelist"
          ]}
          ctaText="Create Your First Scene"
          abTest={{
            enabled: true,
            variants: {
              A: { 
                heroHeading: "Bring Your Story to Life with Ghost-Writers.AI",
                ctaText: "Create Your First Scene" 
              },
              B: { 
                heroHeading: "Finish Your Book Faster with AI Writing Agents", 
                ctaText: "Start Writing Now" 
              },
            },
            currentVariant: "A",
          }}
        />
        <Features 
          features={[
            { 
              title: "Character & Scene Cards", 
              description: "Design structured story elements with ease." 
            },
            { 
              title: "AI Memory Engine", 
              description: "Preserve continuity across chapters and scenes." 
            },
            { 
              title: "Research Assistant", 
              description: "Conduct deep topic research for immersive realism." 
            }
          ]}
        />
        <Companies 
          heading="Trusted by Indie Authors & Storytellers"
          companies={[
            { name: "Reedsy", logo: "/images/companies/reedsy-logo.png" },
            { name: "NaNoWriMo", logo: "/images/companies/nanowrimo-logo.png" },
            { name: "Substack Authors", logo: "/images/companies/substack-logo.png" },
            { name: "Wattpad Creators", logo: "/images/companies/wattpad-logo.png" }
          ]}
        />
        <Testimonials 
          testimonials={[
            {
              text: "Ghost-Writers.AI helped me finish a full novel draft in just 30 days. It's like having a team of editors and researchers in your pocket.",
              rating: 5,
              author: "Ava Morgan",
              position: "Fantasy Author, NaNoWriMo Winner",
            },
            {
              text: "The structured cards and memory engine kept my mystery plot tight. No more messy story docs!",
              rating: 5,
              author: "Julian Scott",
              position: "Crime Novelist",
            },
            {
              text: "I've tried every AI writing tool out there, but Ghost-Writers.AI is the first one that thinks like a storyteller. The memory engine kept my plot tight and the scene cards made pacing so much easier. It feels like collaborating with a seasoned editor who never sleeps.",
              rating: 5,
              author: "Ren Ishikawa",
              position: "Indie Sci-Fi Author, Serialbox Contributor",
            },
            {
              text: "My stories are complex — magic systems layered over espionage plots. Ghost-Writers.AI didn't just keep up, it elevated the whole process. The memory system tracked spells and secrets across timelines, and the scene builder kept the tension razor-sharp. It's the tool I didn't know I needed.",
              rating: 5,
              author: "Marcus Vale",
              position: "Fantasy-Thriller Hybrid Author, Creator of The Sigil Protocol",
            }
          ]}
        />
        <Faq 
          faqs={[
            "What is Ghost-Writers.AI?",
            "How does it support long-form storytelling?",
            "Can I edit what the AI writes?",
            "Is there a free plan for hackathons?",
            "Does it support genres like sci-fi, thriller, or romance?"
          ]}
        />
        <Footer />
      </main>
      <Toaster />
    </ThemeProvider>
  );
}