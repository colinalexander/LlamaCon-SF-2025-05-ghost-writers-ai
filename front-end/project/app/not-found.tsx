'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FBF6F1] flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-lg">
        <div className="w-[500px] h-[500px] mx-auto mb-4">
          <img
            src="/images/ghost-404.png"
            alt="Ghost writing"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Oops!</h1>
          <p className="text-xl">
            Looks like this page has turned into a ghost.
            Don't worry though, you can always find your way back home.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/">
            Return Home
          </Link>
        </Button>
      </div>
    </div>
  );
}