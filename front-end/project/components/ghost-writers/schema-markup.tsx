"use client";

import React from "react";
import Head from "next/head";

interface SchemaMarkupProps {
  name: string;
  url: string;
  logo: string;
}

export default function SchemaMarkup({ name, url, logo }: SchemaMarkupProps) {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": name,
    "url": url,
    "logo": logo,
    "sameAs": [
      "https://www.facebook.com/ghostwritersai",
      "https://www.twitter.com/ghostwritersai",
      "https://www.instagram.com/ghostwritersai"
    ]
  };

  return (
    <Head>
      <title>Ghost-Writers.AI — AI-Powered Storytelling Platform for Fiction Authors</title>
      <meta name="description" content="Ghost-Writers.AI helps you write novels with character cards, story memory, and creative agents. Try it free during LlamaCon 2025!" />
      <meta name="keywords" content="ai writing, storytelling, fiction platform, character builder, plot generator, ghostwriter, novel writing" />
      <meta property="og:title" content="Ghost-Writers.AI — AI-Powered Storytelling Platform" />
      <meta property="og:description" content="Write better stories faster with AI-powered tools for authors." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://www.ghost-writers.ai" />
      <meta property="og:image" content="https://www.ghost-writers.ai/og-image.jpg" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Ghost-Writers.AI — AI-Powered Storytelling" />
      <meta name="twitter:description" content="Write better stories faster with AI-powered tools for authors." />
      <meta name="twitter:image" content="https://www.ghost-writers.ai/twitter-image.jpg" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
    </Head>
  );
}